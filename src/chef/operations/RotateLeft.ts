/**
 * @fileoverview RotateLeft operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput, HighlightPos, HighlightResult } from "../Operation";
import { rot, rotl, rotlCarry } from "../lib/Rotate";

/**
 * Rotate left operation.
 */
export class RotateLeft extends TypedOperation<number[], AnyInput, unknown[]> {
  /**
   * RotateLeft constructor
   */
  constructor() {
    super();

    this.name = "Rotate left";
    this.module = "Default";
    this.description =
      "Rotates each byte to the left by the number of bits specified, optionally carrying the excess bits over to the next byte. Currently only supports 8-bit values.";
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
      return rotlCarry(input, amount);
    } else {
      return rot(input, amount, rotl);
    }
  }

  /**
   * Highlight rotate left
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
   * Highlight rotate left in reverse
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

export default RotateLeft;
