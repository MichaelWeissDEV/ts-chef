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

/**
 * Rail Fence Cipher Decode operation
 */
export class RailFenceCipherDecode extends Operation {
  /**
   * RailFenceCipherDecode constructor
   */
  constructor() {
    super();

    this.name = "Rail Fence Cipher Decode";
    this.module = "Ciphers";
    this.description =
      "Decodes Strings that were created using the Rail fence Cipher provided a key and an offset";
    this.infoURL = "https://wikipedia.org/wiki/Rail_fence_cipher";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Key",
        type: "number",
        value: 2,
      },
      {
        name: "Offset",
        type: "number",
        value: 0,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const [key, offset] = args;

    const cipher = input;

    if (key < 2) {
      throw new OperationError("Key has to be bigger than 2");
    } else if (key > cipher.length) {
      throw new OperationError(
        "Key should be smaller than the cipher's length",
      );
    }

    if (offset < 0) {
      throw new OperationError("Offset has to be a positive integer");
    }

    const cycle = (key - 1) * 2;
    const plaintext = new Array(cipher.length);

    let j = 0;
    let x, y;

    for (y = 0; y < key; y++) {
      for (x = 0; x < cipher.length; x++) {
        if ((y + x + offset) % cycle === 0 || (y - x - offset) % cycle === 0) {
          plaintext[x] = cipher[j++];
        }
      }
    }

    return plaintext.join("");
  }
}

export default RailFenceCipherDecode;
