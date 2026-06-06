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
import { rot, rotl, rotlCarry } from "../lib/Rotate";

/**
 * Rotate left operation.
 */
export class RotateLeft extends Operation {
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
  run(input: any, args: any[]): any {
    if (args[1]) {
      return rotlCarry(input, args[0]);
    } else {
      return rot(input, args[0], rotl);
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
  highlight(pos: any, args: any[]): any {
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
  highlightReverse(pos: any, args: any[]): any {
    return pos;
  }
}

export default RotateLeft;
