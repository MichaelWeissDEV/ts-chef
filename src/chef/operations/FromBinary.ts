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

import { Operation, HighlightPos, HighlightResult } from "../Operation";
import { Utils } from "../Utils";
import { BIN_DELIM_OPTIONS } from "../lib/Delim";
import { fromBinary } from "../lib/Binary";

export class FromBinary extends Operation {
  constructor() {
    super();
    this.name = "From Binary";
    this.module = "Default";
    this.description =
      "Converts a binary string back into its raw form. e.g. 01001000 01101001 becomes Hi";
    this.infoURL = "https://wikipedia.org/wiki/Binary_code";
    this.inputType = "string";
    this.outputType = "byteArray";
    this.args = [
      {
        name: "Delimiter",
        type: "option",
        value: BIN_DELIM_OPTIONS,
      },
      {
        name: "Byte Length",
        type: "number",
        value: 8,
        min: 1,
      },
    ];
  }

  run(input: string, args: unknown[]): number[] {
    const byteLen = (args[1] as number) || 8;
    return fromBinary(input, args[0] as string, byteLen);
  }

  highlight(pos: HighlightPos, args: unknown[]): HighlightResult {
    const delim = Utils.charRep((args[0] as string) || "Space");
    pos[0].start =
      pos[0].start === 0 ? 0 : Math.floor(pos[0].start / (8 + delim.length));
    pos[0].end =
      pos[0].end === 0 ? 0 : Math.ceil(pos[0].end / (8 + delim.length));
    return pos;
  }

  highlightReverse(pos: HighlightPos, args: unknown[]): HighlightResult {
    const delim = Utils.charRep((args[0] as string) || "Space");
    pos[0].start = pos[0].start * (8 + delim.length);
    pos[0].end = pos[0].end * (8 + delim.length) - delim.length;
    return pos;
  }
}

export default FromBinary;
