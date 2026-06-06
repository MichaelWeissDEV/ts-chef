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

import { Operation } from "../Operation";
import OperationError from "../errors/OperationError";
import forge from "node-forge";
import { MD_ALGORITHMS } from "../lib/RSA";

/**
 * RSA Sign operation
 */
export class RSASign extends Operation {
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
  run(input: any, args: any[]): any {
    const [key, password, mdAlgo] = args;
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
