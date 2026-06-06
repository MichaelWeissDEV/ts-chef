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
import { bitOp, sub, BITWISE_OP_DELIMS } from "../lib/BitwiseOp";

export class SUB extends Operation {
  constructor() {
    super();
    this.name = "SUB";
    this.module = "Default";
    this.description =
      "SUB the input with the given key (e.g. <code>fe023da5</code>), MOD 255";
    this.infoURL =
      "https://wikipedia.org/wiki/Bitwise_operation#Bitwise_operators";
    this.inputType = "byteArray";
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

  run(input: number[], args: unknown[]): number[] {
    const arg = args[0] as { string: string; option: string };
    const key = Utils.convertToByteArray(arg.string || "", arg.option);
    return bitOp(input, key, sub);
  }

  highlight(pos: HighlightPos, _args: unknown[]): HighlightResult {
    return pos;
  }

  highlightReverse(pos: HighlightPos, _args: unknown[]): HighlightResult {
    return pos;
  }
}

export default SUB;
