/**
 * @fileoverview RSASign operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import OperationError from "../errors/OperationError";
import forge from "node-forge";
import { MD_ALGORITHMS } from "../lib/RSA";

/**
 * RSA Sign operation
 */
export class RSASign extends TypedOperation<string, string, unknown[]> {
  /**
   * RSASign constructor
   */
  constructor() {
    super();

    this.name = "RSA Sign";
    this.module = "Ciphers";
    this.description = "Sign a plaintext message with a PEM encoded RSA key.";
    this.infoURL = "https://wikipedia.org/wiki/RSA_(cryptosystem)";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "RSA Private Key (PEM)",
        type: "text",
        value: "-----BEGIN RSA PRIVATE KEY-----",
      },
      {
        name: "Key Password",
        type: "text",
        value: "",
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
    const [key, password, mdAlgo] = args as [string, string, string];
    if (key.replace("-----BEGIN RSA PRIVATE KEY-----", "").length === 0) {
      throw new OperationError("Please enter a private key.");
    }
    try {
      const privateKey = forge.pki.decryptRsaPrivateKey(key, password);
      // Generate message hash
      const md = MD_ALGORITHMS[mdAlgo as keyof typeof MD_ALGORITHMS].create();
      md.update(input, "raw");
      // Sign message hash
      const sig = privateKey.sign(md);
      return sig;
    } catch (err) {
      throw new OperationError(err);
    }
  }
}

export default RSASign;
