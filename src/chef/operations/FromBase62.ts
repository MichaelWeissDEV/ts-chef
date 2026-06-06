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
import { BASE62_ALPHABET } from "./ToBase62";
import OperationError from "../errors/OperationError";

/**
 * From Base62 operation
 */
export class FromBase62 extends Operation {
  /**
   * FromBase62 constructor
   */
  constructor() {
    super();
    this.name = "From Base62";
    this.module = "Default";
    this.description =
      "Base62 decodes data from a Base62-encoded string (digits and letters, no special characters).";
    this.inputType = "string";
    this.outputType = "byteArray";
    this.args = [{ name: "Alphabet", type: "string", value: BASE62_ALPHABET }];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {number[]}
   */
  run(input: string, args: unknown[]): number[] {
    const alphabetStr = (args[0] as string) || BASE62_ALPHABET;
    const alphabet = Utils.expandAlphRange(alphabetStr).join("");
    const base = alphabet.length;
    if (base < 2)
      throw new OperationError("Alphabet must be at least 2 characters.");

    const map = new Map<string, number>();
    for (let i = 0; i < alphabet.length; i++) map.set(alphabet[i], i);

    const cleaned = input.trim();
    if (!cleaned) throw new OperationError("Empty input.");

    let leading = 0;
    for (const ch of cleaned) {
      if (ch === alphabet[0]) leading++;
      else break;
    }

    const result: number[] = [0];
    for (const ch of cleaned) {
      const val = map.get(ch);
      if (val === undefined)
        throw new OperationError(`Invalid Base62 character: '${ch}'`);
      let carry = val;
      for (let i = 0; i < result.length; i++) {
        carry += result[i] * base;
        result[i] = carry & 0xff;
        carry >>= 8;
      }
      while (carry > 0) {
        result.push(carry & 0xff);
        carry >>= 8;
      }
    }

    result.reverse();
    // Remove trailing zeros that were added by big-int math if not intended
    // But for BaseX we keep them based on leading zeros count.

    return new Array(leading)
      .fill(0)
      .concat(result.every((x) => x === 0) ? [] : result);
  }
}

export default FromBase62;
