/**
 * @fileoverview LZStringCompress operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
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
