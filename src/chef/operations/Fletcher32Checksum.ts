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

import { Operation, AnyInput } from "../Operation";
import Utils from "../Utils";

/**
 * Fletcher-32 Checksum operation
 */
export class Fletcher32Checksum extends Operation {
  /**
   * Fletcher32Checksum constructor
   */
  constructor() {
    super();

    this.name = "Fletcher-32 Checksum";
    this.module = "Crypto";
    this.description =
      "The Fletcher checksum is an algorithm for computing a position-dependent checksum devised by John Gould Fletcher at Lawrence Livermore Labs in the late 1970s.<br><br>The objective of the Fletcher checksum was to provide error-detection properties approaching those of a cyclic redundancy check but with the lower computational effort associated with summation techniques.";
    this.infoURL =
      "https://wikipedia.org/wiki/Fletcher%27s_checksum#Fletcher-32";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: ArrayBuffer, _args: unknown[]): AnyInput {
    let a = 0,
      b = 0;
    let view: DataView;
    if (ArrayBuffer.isView(input)) {
      view = new DataView(input.buffer, input.byteOffset, input.byteLength);
    } else {
      view = new DataView(input);
    }

    for (let i = 0; i < view.byteLength - 1; i += 2) {
      a = (a + view.getUint16(i, true)) % 0xffff;
      b = (b + a) % 0xffff;
    }
    if (view.byteLength % 2 !== 0) {
      a = (a + view.getUint8(view.byteLength - 1)) % 0xffff;
      b = (b + a) % 0xffff;
    }

    return Utils.hex(((b << 16) | a) >>> 0, 8);
  }
}

export default Fletcher32Checksum;
