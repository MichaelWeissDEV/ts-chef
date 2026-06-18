/**
 * @fileoverview OR operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
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
