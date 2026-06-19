/**
 * @fileoverview PubKeyFromCert operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import r from "jsrsasign";
import { TypedOperation, AnyInput } from "../Operation_new";
import OperationError from "../errors/OperationError";

/**
 * Public Key from Certificate operation
 */
export class PubKeyFromCert extends TypedOperation<string, string, unknown[]> {
  /**
   * PubKeyFromCert constructor
   */
  constructor() {
    super();

    this.name = "Public Key from Certificate";
    this.module = "PublicKey";
    this.description = "Extracts the Public Key from a Certificate.";
    this.infoURL = "https://en.wikipedia.org/wiki/X.509";
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
    let match;
    const regex = /-----BEGIN CERTIFICATE-----/g;
    while ((match = regex.exec(input)) !== null) {
      // find corresponding end tag
      const indexBase64 = match.index + match[0].length;
      const footer = "-----END CERTIFICATE-----";
      const indexFooter = input.indexOf(footer, indexBase64);
      if (indexFooter === -1) {
        throw new OperationError(`PEM footer '${footer}' not found`);
      }

      const certPem = input.substring(match.index, indexFooter + footer.length);
      const cert = new r.X509();
      cert.readCertPEM(certPem);
      let pubKey;
      try {
        pubKey = cert.getPublicKey();
      } catch {
        throw new OperationError("Unsupported public key type");
      }
      const pubKeyPem = r.KEYUTIL.getPEM(pubKey);

      // PEM ends with '\n', so a new key always starts on a new line
      output += pubKeyPem;
    }
    return output;
  }
}

export default PubKeyFromCert;
