/**
 * @fileoverview FromFloat operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import * as ieee754 from "ieee754";
import { TypedOperation } from "../Operation_new";
import { Utils } from "../Utils";
import { DELIM_OPTIONS } from "../lib/Delim";

export class FromFloat extends TypedOperation<string, number[], unknown[]> {
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

    const output = new Uint8Array(floats.length * byteSize);
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
    return Array.from(output);
  }
}

export default FromFloat;
