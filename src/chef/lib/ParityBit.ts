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

import OperationError from "../errors/OperationError";

/**
 * Function to take the user input and encode using the given arguments
 * @param {string} input - string of binary
 * @param {any[]} args - array
 */
export function calculateParityBit(input: string, args: any[]): string {
  let count1s = 0;
  for (let i = 0; i < input.length; i++) {
    const character = input.charAt(i);
    if (character === "1") {
      count1s++;
    } else if (
      character !== args[3] &&
      character !== "0" &&
      character !== " "
    ) {
      throw new OperationError(
        'unexpected character encountered: "' + character + '"',
      );
    }
  }
  let parityBit = "1";
  const flipflop = args[0] === "Even Parity" ? 0 : 1;
  if (count1s % 2 === flipflop) {
    parityBit = "0";
  }
  if (args[1] === "End") {
    return input + parityBit;
  } else {
    return parityBit + input;
  }
}

/**
 * just removes the parity bit to return the original data
 * @param {string} input - string of binary, encoded
 * @param {any[]} args - array
 */
export function decodeParityBit(input: string, args: any[]): string {
  if (args[1] === "End") {
    return input.slice(0, -1);
  } else {
    return input.slice(1);
  }
}
