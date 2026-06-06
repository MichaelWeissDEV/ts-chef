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
import Utils from "../Utils";

/**
 * Fletcher-8 Checksum operation
 */
export class Fletcher8Checksum extends Operation {
  /**
   * Fletcher8Checksum constructor
   */
  constructor() {
    super();

    this.name = "Fletcher-8 Checksum";
    this.module = "Crypto";
    this.description =
      "The Fletcher checksum is an algorithm for computing a position-dependent checksum devised by John Gould Fletcher at Lawrence Livermore Labs in the late 1970s.<br><br>The objective of the Fletcher checksum was to provide error-detection properties approaching those of a cyclic redundancy check but with the lower computational effort associated with summation techniques.";
    this.infoURL = "https://wikipedia.org/wiki/Fletcher%27s_checksum";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    let a = 0,
      b = 0;
    input = new Uint8Array(input);

    for (let i = 0; i < input.length; i++) {
      a = (a + input[i]) % 0xf;
      b = (b + a) % 0xf;
    }

    return Utils.hex(((b << 4) | a) >>> 0, 2);
  }
}

export default Fletcher8Checksum;
