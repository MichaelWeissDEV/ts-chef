/**
 * @fileoverview Fletcher16Checksum operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, AnyInput } from "../Operation";
import Utils from "../Utils";

/**
 * Fletcher-16 Checksum operation
 */
export class Fletcher16Checksum extends Operation {
  /**
   * Fletcher16Checksum constructor
   */
  constructor() {
    super();

    this.name = "Fletcher-16 Checksum";
    this.module = "Crypto";
    this.description =
      "The Fletcher checksum is an algorithm for computing a position-dependent checksum devised by John Gould Fletcher at Lawrence Livermore Labs in the late 1970s.<br><br>The objective of the Fletcher checksum was to provide error-detection properties approaching those of a cyclic redundancy check but with the lower computational effort associated with summation techniques.";
    this.infoURL =
      "https://wikipedia.org/wiki/Fletcher%27s_checksum#Fletcher-16";
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
      a = (a + bytes[i]) % 0xff;
      b = (b + a) % 0xff;
    }

    return Utils.hex(((b << 8) | a) >>> 0, 4);
  }
}

export default Fletcher16Checksum;
