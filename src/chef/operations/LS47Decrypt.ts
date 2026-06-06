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

import Operation from "../Operation";
import * as LS47 from "../lib/LS47";

/**
 * LS47 Decrypt operation
 */
export class LS47Decrypt extends Operation {
  paddingSize: number = 0;

  /**
   * LS47Decrypt constructor
   */
  constructor() {
    super();

    this.name = "LS47 Decrypt";
    this.module = "Crypto";
    this.description =
      "This is a slight improvement of the ElsieFour cipher as described by Alan Kaminsky. We use 7x7 characters instead of original (barely fitting) 6x6, to be able to encrypt some structured information. We also describe a simple key-expansion algorithm, because remembering passwords is popular. Similar security considerations as with ElsieFour hold.<br>The LS47 alphabet consists of following characters: <code>_abcdefghijklmnopqrstuvwxyz.0123456789,-+*/:?!'()</code><br>An LS47 key is a permutation of the alphabet that is then represented in a 7x7 grid used for the encryption or decryption.";
    this.infoURL = "https://github.com/exaexa/ls47";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Password",
        type: "string",
        value: "",
      },
      {
        name: "Padding",
        type: "number",
        value: 10,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    this.paddingSize = parseInt(args[1], 10);

    LS47.initTiles();

    const key = LS47.deriveKey(args[0]);
    return LS47.decryptPad(key, input, this.paddingSize);
  }
}

export default LS47Decrypt;
