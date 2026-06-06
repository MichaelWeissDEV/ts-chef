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
import { B32_ALPHA, B32HEX_ALPHA } from "./ToBase32";
import OperationError from "../errors/OperationError";

/**
 * From Base32 operation
 */
export class FromBase32 extends Operation {
  /**
   * FromBase32 constructor
   */
  constructor() {
    super();
    this.name = "From Base32";
    this.module = "Default";
    this.description =
      "Base32 decodes data from a Base32-encoded string back to its raw format.";
    this.infoURL = "https://wikipedia.org/wiki/Base32";
    this.inputType = "string";
    this.outputType = "byteArray";
    this.args = [
      { name: "Alphabet", type: "string", value: B32_ALPHA },
      { name: "Remove non-alphabet chars", type: "boolean", value: true },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {number[]}
   */
  run(input: string, args: unknown[]): number[] {
    const alphabetStr = (args[0] as string) || B32_ALPHA;
    const removeNonAlpha = (args[1] as boolean) ?? true;
    const alphabet = Utils.expandAlphRange(alphabetStr).join("");

    // Build lookup map
    const map = new Map<string, number>();
    for (let i = 0; i < 32; i++) {
      if (i < alphabet.length) map.set(alphabet[i], i);
    }

    const padChar = alphabet.length > 32 ? alphabet[32] : "=";

    const bytes: number[] = [];
    let buffer = 0;
    let bitsLeft = 0;

    for (let i = 0; i < input.length; i++) {
      const ch = input[i].toUpperCase();
      if (
        ch === padChar ||
        ch === " " ||
        ch === "\r" ||
        ch === "\n" ||
        ch === "\t"
      )
        continue;

      const val = map.get(ch);
      if (val === undefined) {
        if (removeNonAlpha) continue;
        throw new OperationError(`Invalid Base32 character: '${ch}'`);
      }

      buffer = (buffer << 5) | val;
      bitsLeft += 5;
      if (bitsLeft >= 8) {
        bitsLeft -= 8;
        bytes.push((buffer >> bitsLeft) & 0xff);
      }
    }

    return bytes;
  }
}

export default FromBase32;
