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
import { decompress } from "../lib/LZNT1";

/**
 * LZNT1 Decompress operation
 */
export class LZNT1Decompress extends Operation {
  /**
   * LZNT1 Decompress constructor
   */
  constructor() {
    super();

    this.name = "LZNT1 Decompress";
    this.module = "Compression";
    this.description =
      "Decompresses data using the LZNT1 algorithm.<br><br>Similar to the Windows API <code>RtlDecompressBuffer</code>.";
    this.infoURL =
      "https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-xca/5655f4a3-6ba4-489b-959f-e1f407c52f15";
    this.inputType = "byteArray";
    this.outputType = "byteArray";
    this.args = [];
  }

  /**
   * @param {byteArray} input
   * @param {Object[]} args
   * @returns {byteArray}
   */
  run(input: any, args: any[]): any {
    return decompress(input);
  }
}

export default LZNT1Decompress;
