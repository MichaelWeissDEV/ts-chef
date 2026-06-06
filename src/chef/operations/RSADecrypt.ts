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
 * RSA Decrypt operation
 */
export class RSADecrypt extends Operation {
  /**
   * RSADecrypt constructor
   */
  constructor() {
    super();

    this.name = "RSA Decrypt";
    this.module = "Ciphers";
    this.description =
      "Decrypt an RSA encrypted message with a PEM encoded private key.";
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
        name: "Encryption Scheme",
        type: "argSelector",
        value: [
          {
            name: "RSA-OAEP",
            on: [3],
          },
          {
            name: "RSAES-PKCS1-V1_5",
            off: [3],
          },
          {
            name: "RAW",
            off: [3],
          },
        ],
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
    const [pemKey, password, scheme, md] = args;
    if (pemKey.replace("-----BEGIN RSA PRIVATE KEY-----", "").length === 0) {
      throw new OperationError("Please enter a private key.");
    }
    try {
      const privKey = forge.pki.decryptRsaPrivateKey(pemKey, password);
      const dMsg = privKey.decrypt(input, scheme, {
        md: MD_ALGORITHMS[md as keyof typeof MD_ALGORITHMS].create(),
      });
      return forge.util.decodeUtf8(dMsg);
    } catch (err) {
      throw new OperationError(err);
    }
  }
}

export default RSADecrypt;
