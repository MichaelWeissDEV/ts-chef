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
import { affineEncode } from "../lib/Ciphers";

export class AffineCipherEncode extends Operation {
  constructor() {
    super();
    this.name = "Affine Cipher Encode";
    this.module = "Ciphers";
    this.description =
      "The Affine cipher is a type of monoalphabetic substitution cipher, wherein each letter in an alphabet is mapped to its numeric equivalent, encrypted using simple mathematical function (ax + b) % 26, and converted back to a letter.";
    this.infoURL = "https://wikipedia.org/wiki/Affine_cipher";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "a", type: "number", value: 1 },
      { name: "b", type: "number", value: 0 },
    ];
  }

  run(input: string, args: number[]): string {
    return affineEncode(input, args);
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

export default AffineCipherEncode;
