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
import fernet from "fernet";

/**
 * FernetDecrypt operation
 */
export class FernetDecrypt extends Operation {
  /**
   * FernetDecrypt constructor
   */
  constructor() {
    super();

    this.name = "Fernet Decrypt";
    this.module = "Default";
    this.description =
      "Fernet is a symmetric encryption method which makes sure that the message encrypted cannot be manipulated/read without the key. It uses URL safe encoding for the keys. Fernet uses 128-bit AES in CBC mode and PKCS7 padding, with HMAC using SHA256 for authentication. The IV is created from os.random().<br><br><b>Key:</b> The key must be 32 bytes (256 bits) encoded with Base64.";
    this.infoURL = "https://asecuritysite.com/encryption/fer";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Key",
        type: "string",
        value: "",
      },
    ];
    this.checks = [
      {
        pattern: "^[A-Z\\d\\-_=]{20,}$",
        flags: "i",
        args: [],
      },
    ];
  }
  /**
   * @param {String} input
   * @param {Object[]} args
   * @returns {String}
   */
  run(input: any, args: any[]): any {
    const [secretInput] = args;
    try {
      const secret = new fernet.Secret(secretInput);
      const token = new fernet.Token({
        secret: secret,
        token: input,
      });
      return token.decode();
    } catch (err) {
      throw new OperationError(err);
    }
  }
}

export default FernetDecrypt;
