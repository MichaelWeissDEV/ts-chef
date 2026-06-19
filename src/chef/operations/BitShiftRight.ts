/**
 * @fileoverview BitShiftRight operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";

/**
 * Bit shift right operation
 *
 * @category Default
 * @see https://wikipedia.org/wiki/Bitwise_operation#Bit_shifts
 */
export class BitShiftRight extends TypedOperation<ArrayBuffer, ArrayBuffer, unknown[]> {
  constructor() {
    super();
    this.name = "Bit shift right";
    this.module = "Default";
    this.description =
      "Shifts the bits in each byte towards the right by the specified amount. Logical shifts replace the leftmost bits with zeros. Arithmetic shifts preserve the most significant bit (MSB).";
    this.infoURL = "https://wikipedia.org/wiki/Bitwise_operation#Bit_shifts";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [
      {
        name: "Amount",
        type: "number",
        value: 1,
      },
      {
        name: "Type",
        type: "option",
        value: ["Logical shift", "Arithmetic shift"],
      },
    ];
  }

  /**
   * Shifts the bits in each byte of the input towards the right.
   *
   * @param {ArrayBuffer} input - The input data.
   * @param {any[]} args - The operation arguments.
   * @param {number} args[0] - The number of bits to shift by.
   * @param {string} args[1] - The type of shift ("Logical shift" or "Arithmetic shift").
   * @returns {ArrayBuffer} The shifted data.
   */
  run(input: ArrayBuffer, args: unknown[]): ArrayBuffer {
    const amount = args[0] as number;
    const type = args[1] as string;
    const mask = type === "Logical shift" ? 0 : 0x80;
    const data = new Uint8Array(input);
    return data.map((b) => (b >>> amount) ^ (b & mask)).buffer;
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

export default BitShiftRight;
