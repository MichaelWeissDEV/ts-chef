/**
 * @fileoverview SUB operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, HighlightPos, HighlightResult } from "../Operation";
import { Utils } from "../Utils";
import { bitOp, sub, BITWISE_OP_DELIMS } from "../lib/BitwiseOp";

export class SUB extends TypedOperation<number[], number[], unknown[]> {
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
