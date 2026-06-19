/**
 * @fileoverview ToBraille operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";

const BRAILLE_MAP: Record<string, string> = {
  " ": "⠀",
  a: "⠁",
  b: "⠃",
  c: "⠉",
  d: "⠙",
  e: "⠑",
  f: "⠋",
  g: "⠛",
  h: "⠓",
  i: "⠊",
  j: "⠚",
  k: "⠅",
  l: "⠇",
  m: "⠍",
  n: "⠝",
  o: "⠕",
  p: "⠏",
  q: "⠟",
  r: "⠗",
  s: "⠎",
  t: "⠞",
  u: "⠥",
  v: "⠧",
  w: "⠺",
  x: "⠭",
  y: "⠽",
  z: "⠵",
  "1": "⠁",
  "2": "⠃",
  "3": "⠉",
  "4": "⠙",
  "5": "⠑",
  "6": "⠋",
  "7": "⠛",
  "8": "⠓",
  "9": "⠊",
  "0": "⠚",
  ".": "⠲",
  ",": "⠂",
  "?": "⠦",
  "!": "⠖",
  "'": "⠄",
  "-": "⠤",
  ";": "⠆",
  ":": "⠒",
};

export class ToBraille extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "To Braille";
    this.module = "Default";
    this.description = "Translates text to Braille unicode characters.";
    this.infoURL = "https://wikipedia.org/wiki/Braille";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  run(input: string, _args: unknown[]): string {
    return Array.from(input.toLowerCase())
      .map((ch) => BRAILLE_MAP[ch] ?? ch)
      .join("");
  }
}

export default ToBraille;
