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

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ieee754 = require("ieee754");

import { Operation } from "../Operation";
import { Utils } from "../Utils";
import { DELIM_OPTIONS } from "../lib/Delim";

export class FromFloat extends Operation {
  constructor() {
    super();
    this.name = "From Float";
    this.module = "Default";
    this.description = "Convert from IEEE754 Floating Point Numbers";
    this.infoURL = "https://wikipedia.org/wiki/IEEE_754";
    this.inputType = "string";
    this.outputType = "byteArray";
    this.args = [
      {
        name: "Endianness",
        type: "option",
        value: ["Big Endian", "Little Endian"],
      },
      {
        name: "Size",
        type: "option",
        value: ["Float (4 bytes)", "Double (8 bytes)"],
      },
      {
        name: "Delimiter",
        type: "option",
        value: DELIM_OPTIONS,
      },
    ];
  }

  run(input: string, args: unknown[]): number[] {
    if (input.length === 0) return [];

    const [endianness, size, delimiterName] = args as [string, string, string];
    const delim = Utils.charRep(delimiterName || "Space");
    const byteSize = size === "Double (8 bytes)" ? 8 : 4;
    const isLE = endianness === "Little Endian";
    const mLen = byteSize === 4 ? 23 : 52;
    const floats = input.split(delim);

    const output = new Array(floats.length * byteSize);
    for (let i = 0; i < floats.length; i++) {
      ieee754.write(
        output,
        parseFloat(floats[i]),
        i * byteSize,
        isLE,
        mLen,
        byteSize,
      );
    }
    return output;
  }
}

export default FromFloat;
