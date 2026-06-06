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
import { Utils } from "../Utils";
import { bitOp, and, BITWISE_OP_DELIMS } from "../lib/BitwiseOp";

interface ToggleStringArg {
  string: string;
  option: string;
}

/**
 * AND operation
 *
 * @category Bitwise
 */
export class AND extends Operation {
  /**
   * AND constructor
   */
  constructor() {
    super();
    this.name = "AND";
    this.module = "Default";
    this.description = "AND the input with the given key. e.g. fe023da5";
    this.infoURL = "https://wikipedia.org/wiki/Bitwise_operation#AND";
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

  /**
   * Runs the operation.
   *
   * @param {number[]} input - The input byte array.
   * @param {ToggleStringArg[]} args - Operation arguments.
   * @param {ToggleStringArg} args[0] - The key to AND with.
   * @returns {number[]} - The result of the AND operation.
   *
   * @see {@link OR}
   * @see {@link XOR}
   * @see {@link NOT}
   */
  run(input: number[], args: ToggleStringArg[]): number[] {
    const key = Utils.convertToByteArray(args[0].string || "", args[0].option);
    return bitOp(input, key, and);
  }

  highlight(
    pos: Array<{ start: number; end: number }>,
    _args: unknown[],
  ): Array<{ start: number; end: number }> {
    return pos;
  }

  highlightReverse(
    pos: Array<{ start: number; end: number }>,
    _args: unknown[],
  ): Array<{ start: number; end: number }> {
    return pos;
  }
}

export default AND;
