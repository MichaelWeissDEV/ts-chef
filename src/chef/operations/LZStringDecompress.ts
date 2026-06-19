/**
 * @fileoverview LZStringDecompress operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import { OperationError } from "../errors/OperationError";
import {
  COMPRESSION_OUTPUT_FORMATS,
  DECOMPRESSION_FUNCTIONS,
} from "../lib/LZString";

export class LZStringDecompress extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "LZString Decompress";
    this.module = "Compression";
    this.description = "Decompresses data that was compressed with lz-string.";
    this.infoURL = "https://pieroxy.net/blog/pages/lz-string/index.html";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Compression Format",
        type: "option",
        defaultIndex: 0,
        value: COMPRESSION_OUTPUT_FORMATS,
      },
    ];
  }

  run(input: string, args: unknown[]): string {
    const decompress = DECOMPRESSION_FUNCTIONS[args[0] as string];
    if (decompress) {
      return decompress(input) ?? "";
    }
    throw new OperationError("Unable to find decompression function");
  }
}

export default LZStringDecompress;
