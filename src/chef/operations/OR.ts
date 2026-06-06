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
import { bitOp, or, BITWISE_OP_DELIMS } from "../lib/BitwiseOp";

interface ToggleStringArg {
  string: string;
  option: string;
}

export class OR extends Operation {
  constructor() {
    super();
    this.name = "OR";
    this.module = "Default";
    this.description =
      "OR the input with the given key.<br>e.g. <code>fe023da5</code>";
    this.infoURL = "https://wikipedia.org/wiki/Bitwise_operation#OR";
    this.inputType = "ArrayBuffer";
    this.outputType = "byteArray";
    this.args = [
      {
        name: "Key",
        type: "toggleString",
        value: "",
        toggleValues: BITWISE_OP_DELIMS,
      },
    ];
  }

  run(input: ArrayBuffer, args: unknown[]): number[] {
    const arg = args[0] as ToggleStringArg;
    const key = Utils.convertToByteArray(arg.string || "", arg.option);
    return bitOp(Array.from(new Uint8Array(input)), key, or);
  }

  highlight(pos: HighlightPos, _args: unknown[]): HighlightResult {
    return pos;
  }

  highlightReverse(pos: HighlightPos, _args: unknown[]): HighlightResult {
    return pos;
  }
}

export default OR;
