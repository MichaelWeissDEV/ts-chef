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
import lz4 from "lz4js";

/**
 * LZ4 Compress operation
 */
export class LZ4Compress extends Operation {
  /**
   * LZ4Compress constructor
   */
  constructor() {
    super();

    this.name = "LZ4 Compress";
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
  run(input: any, args: any[]): any {
    const inBuf = new Uint8Array(input);
    const compressed = lz4.compress(inBuf);
    return compressed.buffer;
  }
}

export default LZ4Compress;
