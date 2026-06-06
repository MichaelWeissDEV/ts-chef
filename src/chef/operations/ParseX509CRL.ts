/*
 * -----------------------------------------------------------------------------
 * Project:     ts-chef
 * Model:       Qwen 3.5 Coder Next (Local)
 * Version:     1.0.0
 * Author:      Michael Weiss
 * Source:      Ported from GCHQ's CyberChef (JavaScript)
 * License:     Apache License 2.0
 * Description: TypeScript implementation of CyberChef modules.
 * Note:        First Port done by Local Model, Cleanup and fixes by Author
 * -----------------------------------------------------------------------------
 */

import * as r from "jsrsasign";
import { Operation, ArgConfig } from "../Operation";
import { fromBase64 } from "../lib/Base64";
import { toHex } from "../lib/Hex";
import { formatDnObj } from "../lib/PublicKey";
import OperationError from "../errors/OperationError";
import Utils from "../Utils";

/**
 * Parse X.509 CRL operation
 */
export class ParseX509CRL extends Operation {
  /**
   * ParseX509CRL constructor
   */
  constructor() {
    super();

    this.name = "Parse X.509 CRL";
    this.module = "PublicKey";
    this.description = "Parse Certificate Revocation List (CRL)";
    this.infoURL = "https://wikipedia.org/wiki/Certificate_revocation_list";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Input format",
        type: "option",
        value: ["PEM", "DER Hex", "Base64", "Raw"],
      },
    ];
    this.checks = [
      {
        pattern:
          "^-+BEGIN X509 CRL-+\\r?\\n[\\da-z+/\\n\\r]+-+END X509 CRL-+\\r?\\n?$",
        flags: "i",
        args: ["PEM"],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {any[]} args
   * @returns {string} Human-readable description of a Certificate Revocation List (CRL).
   */
  run(input: string, args: any[]): string {
    if (!input.length) {
      return "No input";
    }

    const inputFormat = args[0];

    let undefinedInputFormat = false;
    try {
      switch (inputFormat) {
        case "DER Hex":
          input = input.replace(/\s/g, "").toLowerCase();
          break;
        case "PEM":
          break;
        case "Base64":
          input = toHex(
            fromBase64(input, undefined, "byteArray") as number[],
            "",
          );
          break;
        case "Raw":
          input = toHex(Utils.strToArrayBuffer(input), "");
          break;
        default:
          undefinedInputFormat = true;
      }
    } catch (e) {
      throw new OperationError(
        "Certificate load error (non-certificate input?)",
      );
    }
    if (undefinedInputFormat)
      throw new OperationError("Undefined input format");

    const crl = new (r as any).X509CRL(input);

    let out = `Certificate Revocation List (CRL):
    Version: ${crl.getVersion() === null ? "1 (0x0)" : "2 (0x1)"}
    Signature Algorithm: ${crl.getSignatureAlgorithmField()}
    Issuer:\n${formatDnObj(crl.getIssuer(), 8)}
    Last Update: ${generalizedDateTimeToUTC(crl.getThisUpdate())}
    Next Update: ${generalizedDateTimeToUTC(crl.getNextUpdate())}\n`;

    if (crl.getParam().ext !== undefined) {
      out += `\tCRL extensions:\n${formatCRLExtensions(crl.getParam().ext, 8)}\n`;
    }

    out += `Revoked Certificates:\n${formatRevokedCertificates(crl.getRevCertArray(), 4)}
Signature Value:\n${formatCRLSignature(crl.getSignatureValueHex(), 8)}`;

    return out;
  }
}

/**
 * Generalized date time string to UTC.
 * @param {string} datetime
 * @returns {string} UTC datetime string.
 */
function generalizedDateTimeToUTC(datetime: string): string {
  // Ensure the string is in the correct format
  if (!/^\d{12,14}Z$/.test(datetime)) {
    throw new OperationError(`failed to format datetime string ${datetime}`);
  }

  // Extract components
  let century = "20";
  if (datetime.length === 15) {
    century = datetime.substring(0, 2);
    datetime = datetime.slice(2);
  }
  const year = century + datetime.substring(0, 2);
  const month = datetime.substring(2, 4);
  const day = datetime.substring(4, 6);
  const hour = datetime.substring(6, 8);
  const minute = datetime.substring(8, 10);
  const second = datetime.substring(10, 12);

  // Construct ISO 8601 format string
  const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;

  // Parse using standard Date object
  const isoDateTime = new Date(isoString);

  return isoDateTime.toUTCString();
}

/**
 * Format CRL extensions.
 * @param {any[] | undefined} extensions
 * @param {number} indent
 * @returns {string} Formatted string detailing CRL extensions.
 */
function formatCRLExtensions(
  extensions: any[] | undefined,
  indent: number,
): string {
  if (!Array.isArray(extensions) || extensions.length === 0) {
    return indentString(`No CRL extensions.`, indent);
  }

  let out = ``;

  extensions.sort((a, b) => {
    if (
      !Object.prototype.hasOwnProperty.call(a, "extname") ||
      !Object.prototype.hasOwnProperty.call(b, "extname")
    ) {
      return 0;
    }
    if (a.extname < b.extname) {
      return -1;
    } else if (a.extname === b.extname) {
      return 0;
    } else {
      return 1;
    }
  });

  extensions.forEach((ext) => {
    if (!Object.prototype.hasOwnProperty.call(ext, "extname")) {
      throw new OperationError(
        `CRL entry extension object missing 'extname' key: ${ext}`,
      );
    }
    switch (ext.extname) {
      case "authorityKeyIdentifier":
        out += `X509v3 Authority Key Identifier:\n`;
        if (Object.prototype.hasOwnProperty.call(ext, "kid")) {
          out += `\tkeyid:${colonDelimitedHexFormatString(ext.kid.hex.toUpperCase())}\n`;
        }
        if (Object.prototype.hasOwnProperty.call(ext, "issuer")) {
          out += `\tDirName:${ext.issuer.str}\n`;
        }
        if (Object.prototype.hasOwnProperty.call(ext, "sn")) {
          out += `\tserial:${colonDelimitedHexFormatString(ext.sn.hex.toUpperCase())}\n`;
        }
        break;
      case "cRLDistributionPoints":
        out += `X509v3 CRL Distribution Points:\n`;
        (ext.array as any[]).forEach((distPoint) => {
          const fullName = `Full Name:\n${formatGeneralNames(distPoint.dpname.full, 4)}`;
          out += indentString(fullName, 4) + "\n";
        });
        break;
      case "cRLNumber":
        if (!Object.prototype.hasOwnProperty.call(ext, "num")) {
          throw new OperationError(
            `'cRLNumber' CRL entry extension missing 'num' key: ${ext}`,
          );
        }
        out += `X509v3 CRL Number:\n\t${ext.num.hex.toUpperCase()}\n`;
        break;
      case "issuerAltName":
        out += `X509v3 Issuer Alternative Name:\n${formatGeneralNames(ext.array, 4)}\n`;
        break;
      default:
        out += `${ext.extname}:\n`;
        out += `\tUnsupported CRL extension. Try openssl CLI.\n`;
        break;
    }
  });

  return indentString(chop(out), indent);
}

/**
 * Format general names array.
 * @param {any[]} names
 * @param {number} indent
 * @returns {string} Multi-line formatted string describing all supported general name types.
 */
function formatGeneralNames(names: any[], indent: number): string {
  let out = ``;

  names.forEach((name) => {
    const key = Object.keys(name)[0];

    switch (key) {
      case "ip":
        out += `IP:${name.ip}\n`;
        break;
      case "dns":
        out += `DNS:${name.dns}\n`;
        break;
      case "uri":
        out += `URI:${name.uri}\n`;
        break;
      case "rfc822":
        out += `EMAIL:${name.rfc822}\n`;
        break;
      case "dn":
        out += `DIR:${name.dn.str}\n`;
        break;
      case "other":
        out += `OtherName:${name.other.oid}::${(Object.values(name.other.value)[0] as { str: string }).str}\n`;
        break;
      default:
        out += `${key}: unsupported general name type\n`;
        break;
    }
  });

  return indentString(chop(out), indent);
}

/**
 * Colon-delimited hex formatted output.
 * @param {string} hexString Hex String
 * @returns {string} String representing input hex string with colon delimiter.
 */
function colonDelimitedHexFormatString(hexString: string): string {
  if (hexString.length % 2 !== 0) {
    hexString = "0" + hexString;
  }

  return chop(hexString.replace(/(..)/g, "$&:"));
}

/**
 * Format revoked certificates array
 * @param {any[] | null} revokedCertificates
 * @param {number} indent
 * @returns {string} Multi-line formatted string output of revoked certificates array
 */
function formatRevokedCertificates(
  revokedCertificates: any[] | null,
  indent: number,
): string {
  if (!Array.isArray(revokedCertificates) || revokedCertificates.length === 0) {
    return indentString("No Revoked Certificates.", indent);
  }

  let out = ``;

  revokedCertificates.forEach((revCert) => {
    if (
      !Object.prototype.hasOwnProperty.call(revCert, "sn") ||
      !Object.prototype.hasOwnProperty.call(revCert, "date")
    ) {
      throw new OperationError(
        "invalid revoked certificate object, missing either serial number or date",
      );
    }

    out += `Serial Number: ${revCert.sn.hex.toUpperCase()}
    Revocation Date: ${generalizedDateTimeToUTC(revCert.date)}\n`;
    if (
      Object.prototype.hasOwnProperty.call(revCert, "ext") &&
      Array.isArray(revCert.ext) &&
      revCert.ext.length !== 0
    ) {
      out += `\tCRL entry extensions:\n${indentString(formatCRLEntryExtensions(revCert.ext), 2 * indent)}\n`;
    }
  });

  return indentString(chop(out), indent);
}

/**
 * Format CRL entry extensions.
 * @param {any[]} exts
 * @returns {string} Formatted multi-line string describing CRL entry extensions.
 */
function formatCRLEntryExtensions(exts: any[]): string {
  let out = ``;

  const crlReasonCodeToReasonMessage: Record<number, string> = {
    0: "Unspecified",
    1: "Key Compromise",
    2: "CA Compromise",
    3: "Affiliation Changed",
    4: "Superseded",
    5: "Cessation Of Operation",
    6: "Certificate Hold",
    8: "Remove From CRL",
    9: "Privilege Withdrawn",
    10: "AA Compromise",
  };

  const holdInstructionOIDToName: Record<string, string> = {
    "1.2.840.10040.2.1": "Hold Instruction None",
    "1.2.840.10040.2.2": "Hold Instruction Call Issuer",
    "1.2.840.10040.2.3": "Hold Instruction Reject",
  };

  exts.forEach((ext) => {
    if (!Object.prototype.hasOwnProperty.call(ext, "extname")) {
      throw new OperationError(
        `CRL entry extension object missing 'extname' key: ${ext}`,
      );
    }
    switch (ext.extname) {
      case "cRLReason":
        if (!Object.prototype.hasOwnProperty.call(ext, "code")) {
          throw new OperationError(
            `'cRLReason' CRL entry extension missing 'code' key: ${ext}`,
          );
        }
        out += `X509v3 CRL Reason Code:
    ${Object.prototype.hasOwnProperty.call(crlReasonCodeToReasonMessage, ext.code) ? crlReasonCodeToReasonMessage[ext.code] : `invalid reason code: ${ext.code}`}\n`;
        break;
      case "2.5.29.23": // Hold instruction
        out += `Hold Instruction Code:\n\t${Object.prototype.hasOwnProperty.call(holdInstructionOIDToName, ext.extn.oid) ? holdInstructionOIDToName[ext.extn.oid] : `${ext.extn.oid}: unknown hold instruction OID`}\n`;
        break;
      case "2.5.29.24": // Invalidity Date
        out += `Invalidity Date:\n\t${generalizedDateTimeToUTC(ext.extn.gentime.str)}\n`;
        break;
      default:
        out += `${ext.extname}:\n`;
        out += `\tUnsupported CRL entry extension. Try openssl CLI.\n`;
        break;
    }
  });

  return chop(out);
}

/**
 * Format CRL signature.
 * @param {string} sigHex
 * @param {number} indent
 * @returns {string} String representing hex signature value formatted on multiple lines.
 */
function formatCRLSignature(sigHex: string, indent: number): string {
  if (sigHex.length % 2 !== 0) {
    sigHex = "0" + sigHex;
  }

  return indentString(
    formatMultiLine(chop(sigHex.replace(/(..)/g, "$&:"))),
    indent,
  );
}

/**
 * Format string onto multiple lines.
 * @param {string} longStr
 * @returns {string} String as a multi-line string.
 */
function formatMultiLine(longStr: string): string {
  const lines = [];

  for (let remain = longStr; remain !== ""; remain = remain.substring(54)) {
    lines.push(remain.substring(0, 54));
  }

  return lines.join("\n");
}

/**
 * Indent a multi-line string by n spaces.
 * @param {string} input String
 * @param {number} spaces How many leading spaces
 * @returns {string} Indented string.
 */
function indentString(input: string, spaces: number): string {
  const indentChar = " ".repeat(spaces);
  return input.replace(/^/gm, indentChar);
}

/**
 * Remove last character from a string.
 * @param {string} s String
 * @returns {string} Chopped string.
 */
function chop(s: string): string {
  if (s.length < 1) {
    return s;
  }
  return s.substring(0, s.length - 1);
}

export default ParseX509CRL;
