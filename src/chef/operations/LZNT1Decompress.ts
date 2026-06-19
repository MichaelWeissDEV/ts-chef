/**
 * @fileoverview LZNT1Decompress operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation,  AnyInput  } from "../Operation";
import { decompress } from "../lib/LZNT1";

/**
 * LZNT1 Decompress operation
 */
export class LZNT1Decompress extends TypedOperation<AnyInput, AnyInput, unknown[]> {
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
  run(input: AnyInput, _args: unknown[]): AnyInput {
    return decompress(input as number[]);
  }
}

export default LZNT1Decompress;
