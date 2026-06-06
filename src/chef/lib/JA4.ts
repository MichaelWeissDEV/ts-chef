/**
 * JA4 resources.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 *
 * JA4 Copyright 2023 FoxIO, LLC.
 * @license BSD-3-Clause
 */

import OperationError from "../errors/OperationError";
import {
  parseTLSRecord,
  parseHighestSupportedVersion,
  parseFirstALPNValue,
} from "./TLS";
import { toHexFast } from "./Hex";
import { runHash } from "./Hash";
import Utils from "../Utils";

export interface JA4Result {
  JA4: string;
  JA4_o: string;
  JA4_r: string;
  JA4_ro: string;
}

export interface JA4SResult {
  JA4S: string;
  JA4S_r: string;
}

/**
 * Calculate the JA4 from a given TLS Client Hello Stream
 * @param bytes - Raw TLS record bytes
 * @returns JA4 fingerprint result object
 */
export function toJA4(bytes: Uint8Array): JA4Result {
  let tlsr: ReturnType<typeof parseTLSRecord>;
  try {
    tlsr = parseTLSRecord(bytes);
    if (tlsr.handshake.value.handshakeType.value !== 0x01) {
      throw new Error();
    }
  } catch (err) {
    throw new OperationError(
      "Data is not a valid TLS Client Hello. QUIC is not yet supported.\n" +
        err,
    );
  }

  /* QUIC
        "q" or "t", which denotes whether the hello packet is for QUIC or TCP.
        TODO: Implement QUIC
    */
  const ptype = "t";

  /* TLS Version
        TLS version is shown in 3 different places. If extension 0x002b exists (supported_versions), then the version
        is the highest value in the extension. Remember to ignore GREASE values. If the extension doesn't exist, then
        the TLS version is the value of the Protocol Version. Handshake version (located at the top of the packet)
        should be ignored.
    */
  let version: number = tlsr.handshake.value.helloVersion.value;
  for (const ext of tlsr.handshake.value.extensions.value) {
    if (ext.type.value === "supported_versions") {
      version = parseHighestSupportedVersion(ext.value.data);
      break;
    }
  }
  const versionStr = tlsVersionMapper(version);

  /* SNI
        If the SNI extension (0x0000) exists, then the destination of the connection is a domain, or "d" in the fingerprint.
        If the SNI does not exist, then the destination is an IP address, or "i".
    */
  let sni = "i";
  for (const ext of tlsr.handshake.value.extensions.value) {
    if (ext.type.value === "server_name") {
      sni = "d";
      break;
    }
  }

  /* Number of Ciphers
        2 character number of cipher suites, so if there's 6 cipher suites in the hello packet, then the value should be "06".
        If there's > 99, which there should never be, then output "99". Remember, ignore GREASE values. They don't count.
    */
  let cipherLen = 0;
  for (const cs of tlsr.handshake.value.cipherSuites.value) {
    if (cs.value !== "GREASE") cipherLen++;
  }
  const cipherLenStr =
    cipherLen > 99 ? "99" : cipherLen.toString().padStart(2, "0");

  /* Number of Extensions
        Same as counting ciphers. Ignore GREASE. Include SNI and ALPN.
    */
  let extLen = 0;
  for (const ext of tlsr.handshake.value.extensions.value) {
    if (ext.type.value !== "GREASE") extLen++;
  }
  const extLenStr = extLen > 99 ? "99" : extLen.toString().padStart(2, "0");

  /* ALPN Extension Value
        The first and last characters of the ALPN (Application-Layer Protocol Negotiation) first value.
        If there are no ALPN values or no ALPN extension then we print "00" as the value in the fingerprint.
    */
  let alpn = "00";
  for (const ext of tlsr.handshake.value.extensions.value) {
    if (ext.type.value === "application_layer_protocol_negotiation") {
      alpn = alpnFingerprint(parseFirstALPNValue(ext.value.data));
      break;
    }
  }

  /* Cipher hash
        A 12 character truncated sha256 hash of the list of ciphers sorted in hex order, first 12 characters.
        The list is created using the 4 character hex values of the ciphers, lower case, comma delimited, ignoring GREASE.
    */
  const originalCiphersList: string[] = [];
  for (const cs of tlsr.handshake.value.cipherSuites.value) {
    if (cs.value !== "GREASE") {
      originalCiphersList.push(toHexFast(cs.data));
    }
  }
  const sortedCiphersList = [...originalCiphersList].sort();
  const sortedCiphersRaw = sortedCiphersList.join(",");
  const originalCiphersRaw = originalCiphersList.join(",");
  const sortedCiphers = runHash(
    "sha256",
    Utils.strToArrayBuffer(sortedCiphersRaw),
  ).substring(0, 12);
  const originalCiphers = runHash(
    "sha256",
    Utils.strToArrayBuffer(originalCiphersRaw),
  ).substring(0, 12);

  /* Extension hash
        A 12 character truncated sha256 hash of the list of extensions, sorted by hex value, followed by the list of signature
        algorithms, in the order that they appear (not sorted).
        The extension list is created using the 4 character hex values of the extensions, lower case, comma delimited, sorted
        (not in the order they appear). Ignore the SNI extension (0000) and the ALPN extension (0010) as we've already captured
        them in the a section of the fingerprint. These values are omitted so that the same application would have the same b
        section of the fingerprint regardless of if it were going to a domain, IP, or changing ALPNs.
    */
  const originalExtensionsList: string[] = [];
  let signatureAlgorithms = "";
  for (const ext of tlsr.handshake.value.extensions.value) {
    if (ext.type.value !== "GREASE") {
      originalExtensionsList.push(toHexFast(ext.type.data));
    }
    if (ext.type.value === "signature_algorithms") {
      signatureAlgorithms = toHexFast(ext.value.data.slice(2));
      signatureAlgorithms = signatureAlgorithms.replace(/(.{4})/g, "$1,");
      signatureAlgorithms = signatureAlgorithms.substring(
        0,
        signatureAlgorithms.length - 1,
      );
    }
  }
  const sortedExtensionsList = [...originalExtensionsList]
    .filter((e) => e !== "0000" && e !== "0010")
    .sort();
  const sortedExtensionsRaw =
    sortedExtensionsList.join(",") + "_" + signatureAlgorithms;
  const originalExtensionsRaw =
    originalExtensionsList.join(",") + "_" + signatureAlgorithms;
  const sortedExtensions = runHash(
    "sha256",
    Utils.strToArrayBuffer(sortedExtensionsRaw),
  ).substring(0, 12);
  const originalExtensions = runHash(
    "sha256",
    Utils.strToArrayBuffer(originalExtensionsRaw),
  ).substring(0, 12);

  return {
    JA4: `${ptype}${versionStr}${sni}${cipherLenStr}${extLenStr}${alpn}_${sortedCiphers}_${sortedExtensions}`,
    JA4_o: `${ptype}${versionStr}${sni}${cipherLenStr}${extLenStr}${alpn}_${originalCiphers}_${originalExtensions}`,
    JA4_r: `${ptype}${versionStr}${sni}${cipherLenStr}${extLenStr}${alpn}_${sortedCiphersRaw}_${sortedExtensionsRaw}`,
    JA4_ro: `${ptype}${versionStr}${sni}${cipherLenStr}${extLenStr}${alpn}_${originalCiphersRaw}_${originalExtensionsRaw}`,
  };
}

/**
 * Calculate the JA4Server from a given TLS Server Hello Stream
 * @param bytes - Raw TLS record bytes
 * @returns JA4S fingerprint result object
 */
export function toJA4S(bytes: Uint8Array): JA4SResult {
  let tlsr: ReturnType<typeof parseTLSRecord>;
  try {
    tlsr = parseTLSRecord(bytes);
    if (tlsr.handshake.value.handshakeType.value !== 0x02) {
      throw new Error();
    }
  } catch (err) {
    throw new OperationError(
      "Data is not a valid TLS Server Hello. QUIC is not yet supported.\n" +
        err,
    );
  }

  /* QUIC
        "q" or "t", which denotes whether the hello packet is for QUIC or TCP.
        TODO: Implement QUIC
    */
  const ptype = "t";

  /* TLS Version */
  let version: number = tlsr.handshake.value.helloVersion.value;
  for (const ext of tlsr.handshake.value.extensions.value) {
    if (ext.type.value === "supported_versions") {
      version = parseHighestSupportedVersion(ext.value.data);
      break;
    }
  }
  const versionStr = tlsVersionMapper(version);

  /* Number of Extensions */
  let extLen = tlsr.handshake.value.extensions.value.length;
  const extLenStr = extLen > 99 ? "99" : extLen.toString().padStart(2, "0");

  /* ALPN Extension Chosen Value */
  let alpn = "00";
  for (const ext of tlsr.handshake.value.extensions.value) {
    if (ext.type.value === "application_layer_protocol_negotiation") {
      alpn = alpnFingerprint(parseFirstALPNValue(ext.value.data));
      break;
    }
  }

  /* Chosen Cipher */
  const cipher = toHexFast(tlsr.handshake.value.cipherSuite.data);

  /* Extension hash */
  const extensionsList: string[] = [];
  for (const ext of tlsr.handshake.value.extensions.value) {
    extensionsList.push(toHexFast(ext.type.data));
  }
  const extensionsRaw = extensionsList.join(",");
  const extensionsHash = runHash(
    "sha256",
    Utils.strToArrayBuffer(extensionsRaw),
  ).substring(0, 12);

  return {
    JA4S: `${ptype}${versionStr}${extLenStr}${alpn}_${cipher}_${extensionsHash}`,
    JA4S_r: `${ptype}${versionStr}${extLenStr}${alpn}_${cipher}_${extensionsRaw}`,
  };
}

/**
 * Takes a TLS version value and returns a JA4 TLS version string
 * @param version - Numeric TLS version value
 * @returns Two-character version string
 */
function tlsVersionMapper(version: number): string {
  switch (version) {
    case 0x0304:
      return "13"; // TLS 1.3
    case 0x0303:
      return "12"; // TLS 1.2
    case 0x0302:
      return "11"; // TLS 1.1
    case 0x0301:
      return "10"; // TLS 1.0
    case 0x0300:
      return "s3"; // SSL 3.0
    case 0x0200:
      return "s2"; // SSL 2.0
    case 0x0100:
      return "s1"; // SSL 1.0
    default:
      return "00"; // Unknown
  }
}

/**
 * Checks if a byte is ASCII alphanumeric (0-9, A-Z, a-z).
 * @param byte - Byte value to check
 * @returns True if alphanumeric
 */
function isAlphanumeric(byte: number): boolean {
  return (
    (byte >= 0x30 && byte <= 0x39) ||
    (byte >= 0x41 && byte <= 0x5a) ||
    (byte >= 0x61 && byte <= 0x7a)
  );
}

/**
 * Computes the 2-character ALPN fingerprint from raw ALPN bytes.
 * If both first and last bytes are ASCII alphanumeric, returns their characters.
 * Otherwise, returns first hex digit of first byte + last hex digit of last byte.
 * @param rawBytes - Raw ALPN bytes or null
 * @returns Two-character fingerprint string
 */
function alpnFingerprint(rawBytes: Uint8Array | null): string {
  if (!rawBytes || rawBytes.length === 0) return "00";
  const firstByte = rawBytes[0];
  const lastByte = rawBytes[rawBytes.length - 1];
  if (isAlphanumeric(firstByte) && isAlphanumeric(lastByte)) {
    return String.fromCharCode(firstByte) + String.fromCharCode(lastByte);
  }
  const firstHex = firstByte.toString(16).padStart(2, "0");
  const lastHex = lastByte.toString(16).padStart(2, "0");
  return firstHex[0] + lastHex[1];
}
