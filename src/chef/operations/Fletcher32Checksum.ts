/**
 * @fileoverview Fletcher32Checksum operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import Utils from "../Utils";

/**
 * Fletcher-32 Checksum operation
 */
export class Fletcher32Checksum extends TypedOperation<ArrayBuffer, AnyInput, unknown[]> {
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
