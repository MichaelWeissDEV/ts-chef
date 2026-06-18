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

import { Operation, AnyInput, HighlightPos, HighlightResult } from "../Operation";
import { rot, rotr, rotrCarry } from "../lib/Rotate";

/**
 * Rotate right operation.
 */
export class RotateRight extends Operation {
  /**
   * RotateRight constructor
   */
  constructor() {
    super();

    this.name = "Rotate right";
    this.module = "Default";
    this.description =
      "Rotates each byte to the right by the number of bits specified, optionally carrying the excess bits over to the next byte. Currently only supports 8-bit values.";
    this.infoURL = "https://wikipedia.org/wiki/Bitwise_operation#Bit_shifts";
    this.inputType = "byteArray";
    this.outputType = "byteArray";
    this.args = [
      {
        name: "Amount",
        type: "number",
        value: 1,
      },
      {
        name: "Carry through",
        type: "boolean",
        value: false,
      },
    ];
  }

  /**
   * @param {byteArray} input
   * @param {Object[]} args
   * @returns {byteArray}
   */
  run(input: number[], args: unknown[]): AnyInput {
    const [amount, carry] = args as [number, boolean];
    if (carry) {
      return rotrCarry(input, amount);
    } else {
      return rot(input, amount, rotr);
    }
  }

  /**
   * Highlight rotate right
   *
   * @param {Object[]} pos
   * @param {number} pos[].start
   * @param {number} pos[].end
   * @param {Object[]} args
   * @returns {Object[]} pos
   */
  highlight(pos: HighlightPos, _args: unknown[]): HighlightResult {
    return pos;
  }

  /**
   * Highlight rotate right in reverse
   *
   * @param {Object[]} pos
   * @param {number} pos[].start
   * @param {number} pos[].end
   * @param {Object[]} args
   * @returns {Object[]} pos
   */
  highlightReverse(pos: HighlightPos, _args: unknown[]): HighlightResult {
    return pos;
  }
}

export default RotateRight;
