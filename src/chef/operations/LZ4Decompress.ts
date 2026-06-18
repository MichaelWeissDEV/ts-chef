/**
 * @fileoverview LZ4Decompress operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import Operation, { AnyInput } from "../Operation";
import lz4 from "lz4js";

/**
 * LZ4 Decompress operation
 */
export class LZ4Decompress extends Operation {
  /**
   * LZ4Decompress constructor
   */
  constructor() {
    super();

    this.name = "LZ4 Decompress";
    this.module = "Compression";
    this.description =
      "LZ4 is a lossless data compression algorithm that is focused on compression and decompression speed. It belongs to the LZ77 family of byte-oriented compression schemes.";
    this.infoURL = "https://wikipedia.org/wiki/LZ4_(compression_algorithm)";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {ArrayBuffer}
   */
  run(input: ArrayBuffer, _args: unknown[]): AnyInput {
    const inBuf = new Uint8Array(input);
    const decompressed = lz4.decompress(inBuf);
    return decompressed.buffer;
  }
}

export default LZ4Decompress;
