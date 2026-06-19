/**
 * @fileoverview BitShiftLeft operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";

/**
 * Bit shift left operation
 *
 * @category Default
 * @see https://wikipedia.org/wiki/Bitwise_operation#Bit_shifts
 */
export class BitShiftLeft extends TypedOperation<ArrayBuffer, ArrayBuffer, number[]> {
  constructor() {
    super();
    this.name = "Bit shift left";
    this.module = "Default";
    this.description =
      "Shifts the bits in each byte towards the left by the specified amount.";
    this.infoURL = "https://wikipedia.org/wiki/Bitwise_operation#Bit_shifts";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [
      {
        name: "Amount",
        type: "number",
        value: 1,
      },
    ];
  }

  /**
   * Shifts the bits in each byte of the input towards the left.
   *
   * @param {ArrayBuffer} input - The input data.
   * @param {number[]} args - The operation arguments.
   * @param {number} args[0] - The number of bits to shift by.
   * @returns {ArrayBuffer} The shifted data.
   */
  run(input: ArrayBuffer, args: number[]): ArrayBuffer {
    const amount = args[0];
    const data = new Uint8Array(input);
    return data.map((b) => (b << amount) & 0xff).buffer;
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

export default BitShiftLeft;
