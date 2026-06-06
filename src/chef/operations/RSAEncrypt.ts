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
 * RSA Encrypt operation
 */
export class RSAEncrypt extends Operation {
  /**
   * RSAEncrypt constructor
   */
  constructor() {
    super();

    this.name = "RSA Encrypt";
    this.module = "Ciphers";
    this.description = "Encrypt a message with a PEM encoded RSA public key.";
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
        name: "Encryption Scheme",
        type: "argSelector",
        value: [
          {
            name: "RSA-OAEP",
            on: [2],
          },
          {
            name: "RSAES-PKCS1-V1_5",
            off: [2],
          },
          {
            name: "RAW",
            off: [2],
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
    const [pemKey, scheme, md] = args;

    if (pemKey.replace("-----BEGIN RSA PUBLIC KEY-----", "").length === 0) {
      throw new OperationError("Please enter a public key.");
    }
    try {
      // Load public key
      const pubKey = forge.pki.publicKeyFromPem(pemKey);
      // https://github.com/digitalbazaar/forge/issues/465#issuecomment-271097600
      const plaintextBytes = forge.util.encodeUtf8(input);
      // Encrypt message
      const eMsg = pubKey.encrypt(plaintextBytes, scheme, {
        md: MD_ALGORITHMS[md as keyof typeof MD_ALGORITHMS].create(),
      });
      return eMsg;
    } catch (err: any) {
      if (
        err &&
        err.message === "RSAES-OAEP input message length is too long."
      ) {
        throw new OperationError(
          `RSAES-OAEP input message length (${err.length}) is longer than the maximum allowed length (${err.maxLength}).`,
        );
      }
      throw new OperationError(err);
    }
  }
}

export default RSAEncrypt;
