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
import Utils from "../Utils";

/**
 * RSA Verify operation
 */
export class RSAVerify extends Operation {
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
  run(input: any, args: any[]): any {
    const [pemKey, message, format, mdAlgo] = args;
    if (pemKey.replace("-----BEGIN RSA PUBLIC KEY-----", "").length === 0) {
      throw new OperationError("Please enter a public key.");
    }
    try {
      // Load public key
      const pubKey = forge.pki.publicKeyFromPem(pemKey);
      // Generate message digest
      const md = MD_ALGORITHMS[mdAlgo as keyof typeof MD_ALGORITHMS].create();
      const messageStr = Utils.convertToByteString(message, format);
      md.update(messageStr, "raw");
      // Compare signed message digest and generated message digest
      const result = pubKey.verify(md.digest().bytes(), input);
      return result ? "Verified OK" : "Verification Failure";
    } catch (err: any) {
      if (err && err.message === "Encrypted message length is invalid.") {
        throw new OperationError(
          `Signature length (${err.length}) does not match expected length based on key (${err.expected}).`,
        );
      }
      throw new OperationError(err);
    }
  }
}

export default RSAVerify;
