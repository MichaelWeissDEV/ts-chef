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
import { calculateParityBit, decodeParityBit } from "../lib/ParityBit";

/**
 * Parity Bit operation
 */
export class ParityBit extends Operation {
  /**
   * ParityBit constructor
   */
  constructor() {
    super();

    this.name = "Parity Bit";
    this.module = "Default";
    this.description =
      "A parity bit, or check bit, is the simplest form of error detection. It is a bit which is added to a string of bits and represents if the number of 1's in the binary string is an even number or odd number.<br><br>If a delimiter is specified, the parity bit calculation will be performed on each 'block' of the input data, where the blocks are created by slicing the input at each occurence of the delimiter character";
    this.infoURL = "https://wikipedia.org/wiki/Parity_bit";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Mode",
        type: "option",
        value: ["Even Parity", "Odd Parity"],
      },
      {
        name: "Postion",
        type: "option",
        value: ["Start", "End"],
      },
      {
        name: "Encode or Decode",
        type: "option",
        value: ["Encode", "Decode"],
      },
      {
        name: "Delimiter",
        type: "shortString",
        value: "",
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    if (input.length === 0) {
      return input;
    }
    /**
     * determines weather to use the encode or decode method based off args[2]
     * @param input input to be encoded or decoded
     * @param args array
     */
    const method = (input: string, args: any[]) =>
      args[2] === "Encode"
        ? calculateParityBit(input, args)
        : decodeParityBit(input, args);
    if (args[3].length > 0) {
      const byteStrings = input.split(args[3]);
      for (
        let byteStringsArrayIndex = 0;
        byteStringsArrayIndex < byteStrings.length;
        byteStringsArrayIndex++
      ) {
        byteStrings[byteStringsArrayIndex] = method(
          byteStrings[byteStringsArrayIndex],
          args,
        );
      }
      return byteStrings.join(args[3]);
    }
    return method(input, args);
  }

  /**
   * Highlight Parity Bit
   *
   * @param {Object[]} pos
   * @param {number} pos[].start
   * @param {number} pos[].end
   * @param {Object[]} args
   * @returns {Object[]} pos
   */
  highlight(pos: any, args: any[]): any {
    if (args[3].length === 0) {
      if (args[1] === "Prepend") {
        pos[0].start += 1;
        pos[0].end += 1;
      }
      return pos;
    }
    // need to be able to read input to do the highlighting when there is a delimiter
  }

  /**
   * Highlight Parity Bit in reverse
   *
   * @param {Object[]} pos
   * @param {number} pos[].start
   * @param {number} pos[].end
   * @param {Object[]} args
   * @returns {Object[]} pos
   */
  highlightReverse(pos: any, args: any[]): any {
    if (args[3].length === 0) {
      if (args[1] === "Prepend") {
        if (pos[0].start > 0) {
          pos[0].start -= 1;
        }
        pos[0].end -= 1;
      }
      return pos;
    }
  }
}

export default ParityBit;
