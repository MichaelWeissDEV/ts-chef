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
import { LETTER_DELIM_OPTIONS, WORD_DELIM_OPTIONS } from "../lib/Delim";

const MORSE_TABLE: Record<string, string> = {
  A: "<dot><dash>",
  B: "<dash><dot><dot><dot>",
  C: "<dash><dot><dash><dot>",
  D: "<dash><dot><dot>",
  E: "<dot>",
  F: "<dot><dot><dash><dot>",
  G: "<dash><dash><dot>",
  H: "<dot><dot><dot><dot>",
  I: "<dot><dot>",
  J: "<dot><dash><dash><dash>",
  K: "<dash><dot><dash>",
  L: "<dot><dash><dot><dot>",
  M: "<dash><dash>",
  N: "<dash><dot>",
  O: "<dash><dash><dash>",
  P: "<dot><dash><dash><dot>",
  Q: "<dash><dash><dot><dash>",
  R: "<dot><dash><dot>",
  S: "<dot><dot><dot>",
  T: "<dash>",
  U: "<dot><dot><dash>",
  V: "<dot><dot><dot><dash>",
  W: "<dot><dash><dash>",
  X: "<dash><dot><dot><dash>",
  Y: "<dash><dot><dash><dash>",
  Z: "<dash><dash><dot><dot>",
  "1": "<dot><dash><dash><dash><dash>",
  "2": "<dot><dot><dash><dash><dash>",
  "3": "<dot><dot><dot><dash><dash>",
  "4": "<dot><dot><dot><dot><dash>",
  "5": "<dot><dot><dot><dot><dot>",
  "6": "<dash><dot><dot><dot><dot>",
  "7": "<dash><dash><dot><dot><dot>",
  "8": "<dash><dash><dash><dot><dot>",
  "9": "<dash><dash><dash><dash><dot>",
  "0": "<dash><dash><dash><dash><dash>",
  ".": "<dot><dash><dot><dash><dot><dash>",
  ",": "<dash><dash><dot><dot><dash><dash>",
  ":": "<dash><dash><dash><dot><dot><dot>",
  ";": "<dash><dot><dash><dot><dash><dot>",
  "!": "<dash><dot><dash><dot><dash><dash>",
  "?": "<dot><dot><dash><dash><dot><dot>",
  "'": "<dot><dash><dash><dash><dash><dot>",
  '"': "<dot><dash><dot><dot><dash><dot>",
  "/": "<dash><dot><dot><dash><dot>",
  "-": "<dash><dot><dot><dot><dot><dash>",
  "+": "<dot><dash><dot><dash><dot>",
  "(": "<dash><dot><dash><dash><dot>",
  ")": "<dash><dot><dash><dash><dot><dash>",
  "@": "<dot><dash><dash><dot><dash><dot>",
  "=": "<dash><dot><dot><dot><dash>",
  "&": "<dot><dash><dot><dot><dot>",
  _: "<dot><dot><dash><dash><dot><dash>",
  $: "<dot><dot><dot><dash><dot><dot><dash>",
  " ": "<dot><dot><dot><dot><dot><dot><dot>",
};

export class FromMorseCode extends Operation {
  private reversedTable: Record<string, string> | null = null;

  constructor() {
    super();
    this.name = "From Morse Code";
    this.module = "Default";
    this.description =
      "Translates Morse Code into (upper case) alphanumeric characters.";
    this.infoURL = "https://wikipedia.org/wiki/Morse_code";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Letter delimiter",
        type: "option",
        value: LETTER_DELIM_OPTIONS,
      },
      {
        name: "Word delimiter",
        type: "option",
        value: WORD_DELIM_OPTIONS,
      },
    ];
    this.checks = [
      {
        pattern: "(?:^[-. \\n]{5,}$|^[_. \\n]{5,}$|^(?:dash|dot| |\\n){5,}$)",
        flags: "i",
        args: ["Space", "Line feed"],
      },
    ];
  }

  run(input: string, args: unknown[]): string {
    if (!this.reversedTable) {
      this.buildReversedTable();
    }

    const letterDelim = Utils.charRep(args[0] as string);
    const wordDelim = Utils.charRep(args[1] as string);

    input = input.replace(/-|‐|−|_|–|—|dash/gi, "<dash>");
    input = input.replace(/\.|·|dot/gi, "<dot>");

    const words = input.split(wordDelim).map((word) => {
      return word
        .split(letterDelim)
        .map((signal) => this.reversedTable![signal] ?? "")
        .join("");
    });

    return words.join(" ");
  }

  private buildReversedTable(): void {
    this.reversedTable = {};
    for (const letter in MORSE_TABLE) {
      const signal = MORSE_TABLE[letter];
      this.reversedTable[signal] = letter;
    }
  }
}

export default FromMorseCode;
