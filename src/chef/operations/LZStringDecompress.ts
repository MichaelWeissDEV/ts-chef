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

import { Operation } from "../Operation";
import { OperationError } from "../errors/OperationError";
import {
  COMPRESSION_OUTPUT_FORMATS,
  DECOMPRESSION_FUNCTIONS,
} from "../lib/LZString";

export class LZStringDecompress extends Operation {
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
