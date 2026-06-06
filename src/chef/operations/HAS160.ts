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
import { runHash } from "../lib/Hash";

/**
 * HAS-160 operation
 */
export class HAS160 extends Operation {
  /**
   * HAS-160 constructor
   */
  constructor() {
    super();

    this.name = "HAS-160";
    this.module = "Crypto";
    this.description =
      "HAS-160 is a cryptographic hash function designed for use with the Korean KCDSA digital signature algorithm. It is derived from SHA-1, with assorted changes intended to increase its security. It produces a 160-bit output.<br><br>HAS-160 is used in the same way as SHA-1. First it divides input in blocks of 512 bits each and pads the final block. A digest function updates the intermediate hash value by processing the input blocks in turn.<br><br>The message digest algorithm consists, by default, of 80 rounds.";
    this.infoURL = "https://wikipedia.org/wiki/HAS-160";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      {
        name: "Rounds",
        type: "number",
        value: 80,
        min: 1,
        max: 80,
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    return runHash("has160", input, { rounds: args[0] });
  }
}

export default HAS160;
