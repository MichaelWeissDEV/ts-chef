/**
 * @fileoverview PubKeyFromPrivKey operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import r from "jsrsasign";
import { TypedOperation } from "../Operation";
import OperationError from "../errors/OperationError";

interface PrivateKeyComponents {
  type?: string;
  curve?: string;
  generatePublicKeyHex?: () => string;
  p?: unknown;
  q?: unknown;
  g?: unknown;
  y?: unknown;
  n?: unknown;
  e?: unknown;
}

/**
 * Public Key from Private Key operation
 */
export class PubKeyFromPrivKey extends TypedOperation<
  string,
  string,
  unknown[]
> {
  /**
   * PubKeyFromPrivKey constructor
   */
  constructor() {
    super();

    this.name = "Public Key from Private Key";
    this.module = "PublicKey";
    this.description = "Extracts the Public Key from a Private Key.";
    this.infoURL = "https://en.wikipedia.org/wiki/PKCS_8";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
    this.checks = [];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, _args: unknown[]): string {
    let output = "";
    let match: RegExpExecArray | null;
    const regex = /-----BEGIN ((RSA |EC |DSA )?PRIVATE KEY)-----/g;
    while ((match = regex.exec(input)) !== null) {
      // find corresponding end tag
      const indexBase64 = match.index + match[0].length;
      const footer = `-----END ${match[1]}-----`;
      const indexFooter = input.indexOf(footer, indexBase64);
      if (indexFooter === -1) {
        throw new OperationError(`PEM footer '${footer}' not found`);
      }

      const privKeyPem = input.substring(
        match.index,
        indexFooter + footer.length,
      );
      let privKey: PrivateKeyComponents;
      try {
        privKey = r.KEYUTIL.getKey(
          privKeyPem,
        ) as unknown as PrivateKeyComponents;
      } catch (err) {
        throw new OperationError(`Unsupported key type: ${err}`);
      }
      let pubKey: unknown;
      if (privKey.type && privKey.type === "EC") {
        if (!privKey.curve || !privKey.generatePublicKeyHex) {
          throw new OperationError("Incomplete EC private key");
        }
        const ecPublicKey = new r.KJUR.crypto.ECDSA({ curve: privKey.curve });
        ecPublicKey.setPublicKeyHex(privKey.generatePublicKeyHex());
        pubKey = ecPublicKey;
      } else if (privKey.type && privKey.type === "DSA") {
        if (!privKey.y) {
          throw new OperationError(
            `DSA Private Key in PKCS#8 is not supported`,
          );
        }
        const dsaPublicKey = new r.KJUR.crypto.DSA();
        dsaPublicKey.setPublic(privKey.p, privKey.q, privKey.g, privKey.y);
        pubKey = dsaPublicKey;
      } else if (privKey.n && privKey.e) {
        const rsaPublicKey = new r.RSAKey();
        rsaPublicKey.setPublic(privKey.n, privKey.e);
        pubKey = rsaPublicKey;
      } else {
        throw new OperationError(`Unsupported key type`);
      }
      const pubKeyPem = r.KEYUTIL.getPEM(pubKey);

      // PEM ends with '\n', so a new key always starts on a new line
      output += pubKeyPem;
    }
    return output;
  }
}

export default PubKeyFromPrivKey;
