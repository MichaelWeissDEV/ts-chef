/**
 * @fileoverview ConvertToNATOAlphabet operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation } from "../Operation";

const NATO_LOOKUP: Record<string, string> = {
  A: "Alfa ",
  B: "Bravo ",
  C: "Charlie ",
  D: "Delta ",
  E: "Echo ",
  F: "Foxtrot ",
  G: "Golf ",
  H: "Hotel ",
  I: "India ",
  J: "Juliett ",
  K: "Kilo ",
  L: "Lima ",
  M: "Mike ",
  N: "November ",
  O: "Oscar ",
  P: "Papa ",
  Q: "Quebec ",
  R: "Romeo ",
  S: "Sierra ",
  T: "Tango ",
  U: "Uniform ",
  V: "Victor ",
  W: "Whiskey ",
  X: "X-ray ",
  Y: "Yankee ",
  Z: "Zulu ",
  "0": "Zero ",
  "1": "One ",
  "2": "Two ",
  "3": "Three ",
  "4": "Four ",
  "5": "Five ",
  "6": "Six ",
  "7": "Seven ",
  "8": "Eight ",
  "9": "Nine ",
  ",": "Comma ",
  "/": "Fraction bar ",
  ".": "Full stop ",
};

/**
 * Convert to NATO alphabet operation
 *
 * @category Default
 * @see https://wikipedia.org/wiki/NATO_phonetic_alphabet
 */
export class ConvertToNATOAlphabet extends Operation {
  /**
   * ConvertToNATOAlphabet constructor
   */
  constructor() {
    super();
    this.name = "Convert to NATO alphabet";
    this.module = "Default";
    this.description =
      "Converts characters to their representation in the NATO phonetic alphabet.";
    this.infoURL = "https://wikipedia.org/wiki/NATO_phonetic_alphabet";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * Runs the operation.
   *
   * @param {string} input
   * @param {unknown[]} _args
   * @returns {string}
   */
  run(input: string, _args: unknown[]): string {
    return input.replace(/[a-z0-9,/.]/gi, (letter) => {
      return NATO_LOOKUP[letter.toUpperCase()] ?? letter;
    });
  }
}

export default ConvertToNATOAlphabet;
