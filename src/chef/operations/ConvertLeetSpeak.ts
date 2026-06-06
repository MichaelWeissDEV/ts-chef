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

const TO_LEET_MAP: Record<string, string> = {
  a: "4",
  b: "b",
  c: "c",
  d: "d",
  e: "3",
  f: "f",
  g: "g",
  h: "h",
  i: "1",
  j: "j",
  k: "k",
  l: "l",
  m: "m",
  n: "n",
  o: "0",
  p: "p",
  q: "q",
  r: "r",
  s: "5",
  t: "7",
  u: "u",
  v: "v",
  w: "w",
  x: "x",
  y: "y",
  z: "z",
};

const FROM_LEET_MAP: Record<string, string> = {
  "4": "a",
  b: "b",
  c: "c",
  d: "d",
  "3": "e",
  f: "f",
  g: "g",
  h: "h",
  "1": "i",
  j: "j",
  k: "k",
  l: "l",
  m: "m",
  n: "n",
  "0": "o",
  p: "p",
  q: "q",
  r: "r",
  "5": "s",
  "7": "t",
  u: "u",
  v: "v",
  w: "w",
  x: "x",
  y: "y",
  z: "z",
};

/**
 * Convert Leet Speak operation
 *
 * @category Default
 * @see https://wikipedia.org/wiki/Leet
 */
export class ConvertLeetSpeak extends Operation {
  /**
   * ConvertLeetSpeak constructor
   */
  constructor() {
    super();
    this.name = "Convert Leet Speak";
    this.module = "Default";
    this.description = "Converts to and from Leet Speak.";
    this.infoURL = "https://wikipedia.org/wiki/Leet";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Direction",
        type: "option",
        value: ["To Leet Speak", "From Leet Speak"],
        defaultIndex: 0,
      },
    ];
  }

  /**
   * Runs the operation.
   *
   * @param {string} input
   * @param {string[]} args
   * @returns {string}
   */
  run(input: string, args: string[]): string {
    const direction = args[0];

    if (direction === "To Leet Speak") {
      return input.replace(/[a-z]/gi, (char) => {
        const leetChar = TO_LEET_MAP[char.toLowerCase()] || char;
        return char === char.toUpperCase() ? leetChar.toUpperCase() : leetChar;
      });
    } else {
      return input.replace(/[48cd3f6h1jklmn0pqr57uvwxyz]/gi, (char) => {
        return FROM_LEET_MAP[char] || char;
      });
    }
  }
}

export default ConvertLeetSpeak;
