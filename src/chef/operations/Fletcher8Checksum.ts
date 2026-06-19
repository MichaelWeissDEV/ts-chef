/**
 * @fileoverview Fletcher8Checksum operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";
import Utils from "../Utils";

/**
 * Fletcher-8 Checksum operation
 */
export class Fletcher8Checksum extends TypedOperation<ArrayBuffer, AnyInput, unknown[]> {
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
  run(input: ArrayBuffer, _args: unknown[]): AnyInput {
    let a = 0,
      b = 0;
    const bytes = new Uint8Array(input);

    for (let i = 0; i < bytes.length; i++) {
      a = (a + bytes[i]) % 0xf;
      b = (b + a) % 0xf;
    }

    return Utils.hex(((b << 4) | a) >>> 0, 2);
  }
}

export default Fletcher8Checksum;
