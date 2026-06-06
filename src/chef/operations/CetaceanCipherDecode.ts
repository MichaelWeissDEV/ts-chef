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

/**
 * Cetacean Cipher Decode operation
 *
 * @category Ciphers
 */
export class CetaceanCipherDecode extends Operation {
  constructor() {
    super();
    this.name = "Cetacean Cipher Decode";
    this.module = "Ciphers";
    this.description =
      "Decode Cetacean Cipher input. e.g. EEEEEEEEEeeEeEEEEEEEEEEEEeeEeEEe becomes hi";
    this.infoURL = "https://hitchhikers.fandom.com/wiki/Dolphins";
    this.inputType = "string";
    this.outputType = "string";
    this.checks = [
      {
        pattern: "^(?:[eE]{16,})(?: [eE]{16,})*$",
        flags: "",
        args: [],
      },
    ];
    this.args = [];
  }

  /**
   * Runs the Cetacean Cipher Decode operation.
   *
   * @param {string} input - The Cetacean Cipher encoded string.
   * @param {unknown[]} _args - Unused arguments.
   * @returns {string} - The decoded plaintext string.
   */
  run(input: string, _args: unknown[]): string {
    const binaryArray: number[] = [];
    for (const char of input) {
      if (char === " ") {
        binaryArray.push(...[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]);
      } else {
        binaryArray.push(char === "e" ? 1 : 0);
      }
    }

    const byteArray: string[] = [];
    for (let i = 0; i < binaryArray.length; i += 16) {
      byteArray.push(binaryArray.slice(i, i + 16).join(""));
    }

    return byteArray
      .map((byte) => String.fromCharCode(parseInt(byte, 2)))
      .join("");
  }
}

export default CetaceanCipherDecode;
