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
  COMPRESSION_FUNCTIONS,
} from "../lib/LZString";

export class LZStringCompress extends Operation {
  constructor() {
    super();
    this.name = "LZString Compress";
    this.module = "Compression";
    this.description = "Compress the input with lz-string.";
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
    const compress = COMPRESSION_FUNCTIONS[args[0] as string];
    if (compress) {
      return compress(input);
    }
    throw new OperationError("Unable to find compression function");
  }
}

export default LZStringCompress;
