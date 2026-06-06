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

export class ToFloat extends Operation {
  constructor() {
    super();
    this.name = "To float";
    this.module = "Default";
    this.description =
      "Converts the input data to an IEEE 754 floating point number.";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      {
        name: "Size",
        type: "option",
        value: ["Float (4 bytes)", "Double (8 bytes)"],
      },
      {
        name: "Endianness",
        type: "option",
        value: ["Big Endian", "Little Endian"],
      },
      {
        name: "Delimiter",
        type: "option",
        value: ["Line feed", "CRLF", "Space", "Comma", "Semi-colon"],
      },
    ];
  }

  run(input: ArrayBuffer, args: unknown[]): string {
    const size = args[0] as string;
    const endian = args[1] as string;
    const delimOpt = args[2] as string;
    const delims: Record<string, string> = {
      "Line feed": "\n",
      CRLF: "\r\n",
      Space: " ",
      Comma: ",",
      "Semi-colon": ";",
    };
    const delim = delims[delimOpt] ?? "\n";
    const littleEndian = endian === "Little Endian";
    const byteSize = size.startsWith("Float") ? 4 : 8;

    const bytes = new Uint8Array(input);
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const results: string[] = [];

    for (let i = 0; i + byteSize <= bytes.length; i += byteSize) {
      const val =
        byteSize === 4
          ? dv.getFloat32(i, littleEndian)
          : dv.getFloat64(i, littleEndian);
      results.push(val.toString());
    }

    return results.join(delim);
  }
}

export default ToFloat;
