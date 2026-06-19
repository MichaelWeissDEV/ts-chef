/**
 * @fileoverview Fletcher64Checksum operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";
import Utils from "../Utils";

/**
 * Fletcher-64 Checksum operation
 */
export class Fletcher64Checksum extends TypedOperation<ArrayBuffer, AnyInput, unknown[]> {
  /**
   * Fletcher64Checksum constructor
   */
  constructor() {
    super();

    this.name = "Fletcher-64 Checksum";
    this.module = "Crypto";
    this.description =
      "The Fletcher checksum is an algorithm for computing a position-dependent checksum devised by John Gould Fletcher at Lawrence Livermore Labs in the late 1970s.<br><br>The objective of the Fletcher checksum was to provide error-detection properties approaching those of a cyclic redundancy check but with the lower computational effort associated with summation techniques.";
    this.infoURL =
      "https://wikipedia.org/wiki/Fletcher%27s_checksum#Fletcher-64";
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

    for (let i = 0; i < view.byteLength - 3; i += 4) {
      a = (a + view.getUint32(i, true)) % 0xffffffff;
      b = (b + a) % 0xffffffff;
    }
    if (view.byteLength % 4 !== 0) {
      let lastValue = 0;
      for (let i = 0; i < view.byteLength % 4; i++) {
        lastValue = (lastValue << 8) | view.getUint8(view.byteLength - 1 - i);
      }
      a = (a + lastValue) % 0xffffffff;
      b = (b + a) % 0xffffffff;
    }

    return Utils.hex(b >>> 0, 8) + Utils.hex(a >>> 0, 8);
  }
}

export default Fletcher64Checksum;
