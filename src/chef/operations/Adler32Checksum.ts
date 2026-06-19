/**
 * @fileoverview Adler32Checksum operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import { Utils } from "../Utils";

/**
 * Adler-32 Checksum operation
 *
 * @category Crypto
 * @see https://wikipedia.org/wiki/Adler-32
 */
export class Adler32Checksum extends TypedOperation<ArrayBuffer, string, unknown[]> {
  constructor() {
    super();
    this.name = "Adler-32 Checksum";
    this.module = "Crypto";
    this.description =
      "Adler-32 is a checksum algorithm invented by Mark Adler in 1995, a modification of the Fletcher checksum. Compared to a CRC of the same length, it trades reliability for speed.";
    this.infoURL = "https://wikipedia.org/wiki/Adler-32";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * Runs the operation.
   *
   * @param {ArrayBuffer} input
   * @param {unknown[]} _args
   * @returns {string}
   */
  run(input: ArrayBuffer, _args: unknown[]): string {
    const MOD_ADLER = 65521;
    let a = 1;
    let b = 0;
    const data = new Uint8Array(input);

    for (let i = 0; i < data.length; i++) {
      a += data[i];
      b += a;
    }

    a %= MOD_ADLER;
    b %= MOD_ADLER;

    return Utils.hex(((b << 16) | a) >>> 0, 8);
  }
}

export default Adler32Checksum;
