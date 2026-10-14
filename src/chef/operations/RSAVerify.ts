/**
 * @fileoverview RSAVerify operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import OperationError from "../errors/OperationError";
import forge from "node-forge";
import { constants, publicDecrypt, timingSafeEqual } from "node:crypto";
import { MD_ALGORITHMS } from "../lib/RSA";
import Utils from "../Utils";

/**
 * RSA Verify operation
 */
export class RSAVerify extends TypedOperation<string, string, unknown[]> {
  /**
   * RSAVerify constructor
   */
  constructor() {
    super();

    this.name = "RSA Verify";
    this.module = "Ciphers";
    this.description =
      "Verify a message against a signature and a public PEM encoded RSA key.";
    this.infoURL = "https://wikipedia.org/wiki/RSA_(cryptosystem)";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "RSA Public Key (PEM)",
        type: "text",
        value: "-----BEGIN RSA PUBLIC KEY-----",
      },
      {
        name: "Message",
        type: "text",
        value: "",
      },
      {
        name: "Message format",
        type: "option",
        value: ["Raw", "Hex", "Base64"],
      },
      {
        name: "Message Digest Algorithm",
        type: "option",
        value: Object.keys(MD_ALGORITHMS),
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, args: unknown[]): string {
    const [pemKey, message, format, mdAlgo] = args as [
      string,
      string,
      string,
      string,
    ];
    if (pemKey.replace("-----BEGIN RSA PUBLIC KEY-----", "").length === 0) {
      throw new OperationError("Please enter a public key.");
    }
    try {
      // Load public key
      const pubKey = forge.pki.publicKeyFromPem(pemKey);
      const signature = Buffer.from(input, "latin1");
      const expected = Math.ceil(pubKey.n.bitLength() / 8);
      if (signature.length !== expected) {
        throw new OperationError(`Signature length (${signature.length}) does not match expected length based on key (${expected}).`);
      }
      if (!Object.hasOwn(MD_ALGORITHMS, mdAlgo)) throw new OperationError("Unknown message digest algorithm.");
      const messageStr = Utils.convertToByteString(message, format);
      const md = MD_ALGORITHMS[mdAlgo as keyof typeof MD_ALGORITHMS].create();
      md.update(messageStr, "raw");
      const digest = md.digest().bytes();
      // OpenSSL checks PKCS#1 type-1 padding; compare the entire DigestInfo,
      // instead of forge's permissive ASN.1 validator (GHSA-86w9-cpqp-85rv).
      // Keep forge's raw hash semantics and PEM parser for existing recipes.
      const decoded = publicDecrypt({
        key: forge.pki.publicKeyToPem(pubKey), padding: constants.RSA_PKCS1_PADDING,
      }, signature);
      const algorithm = mdAlgo.toLowerCase().replace("-", "");
      const matches = (withNull: boolean) => {
        const { asn1 } = forge;
        const oid = asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false, asn1.oidToDer(forge.pki.oids[algorithm]).getBytes());
        const identifier = withNull ? [oid, asn1.create(asn1.Class.UNIVERSAL, asn1.Type.NULL, false, "")] : [oid];
        const info = asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
          asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, identifier),
          asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OCTETSTRING, false, digest),
        ]);
        const expectedInfo = Buffer.from(asn1.toDer(info).getBytes(), "latin1");
        return decoded.length === expectedInfo.length && timingSafeEqual(decoded, expectedInfo);
      };
      // SHA AlgorithmIdentifiers historically permit omitted NULL parameters.
      const result = matches(true) || (mdAlgo !== "MD5" && matches(false));
      return result ? "Verified OK" : "Verification Failure";
    } catch (err) {
      const rsaError = err as Error & { length?: number; expected?: number };
      if (rsaError.message === "Encrypted message length is invalid.") {
        throw new OperationError(
          `Signature length (${rsaError.length}) does not match expected length based on key (${rsaError.expected}).`,
        );
      }
      throw new OperationError(
        err instanceof Error ? err.message : String(err),
      );
    }
  }
}

export default RSAVerify;
