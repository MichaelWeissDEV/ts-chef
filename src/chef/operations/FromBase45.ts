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
import { BASE45_ALPHABET } from "./ToBase45";
import OperationError from "../errors/OperationError";

/**
 * From Base45 operation
 */
export class FromBase45 extends Operation {
  /**
   * FromBase45 constructor
   */
  constructor() {
    super();
    this.name = "From Base45";
    this.module = "Default";
    this.description =
      "Base45 decodes data (used in EU Digital COVID Certificate).";
    this.inputType = "string";
    this.outputType = "byteArray";
    this.args = [{ name: "Alphabet", type: "string", value: BASE45_ALPHABET }];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {number[]}
   */
  run(input: string, args: unknown[]): number[] {
    const alphabetStr = (args[0] as string) || BASE45_ALPHABET;
    const alphabet = Utils.expandAlphRange(alphabetStr).join("");

    const map = new Map<string, number>();
    for (let i = 0; i < alphabet.length; i++) map.set(alphabet[i], i);

    const result: number[] = [];
    const cleaned = input.split("").filter((c) => map.has(c));

    for (let i = 0; i < cleaned.length; i += 3) {
      if (i + 2 < cleaned.length) {
        const c = map.get(cleaned[i])!;
        const d = map.get(cleaned[i + 1])!;
        const e = map.get(cleaned[i + 2])!;
        const n = c + d * 45 + e * 45 * 45;
        if (n > 65535) throw new OperationError("Invalid Base45 sequence.");
        result.push((n >> 8) & 0xff);
        result.push(n & 0xff);
      } else if (i + 1 < cleaned.length) {
        const c = map.get(cleaned[i])!;
        const d = map.get(cleaned[i + 1])!;
        const n = c + d * 45;
        if (n > 255) throw new OperationError("Invalid Base45 sequence.");
        result.push(n & 0xff);
      } else {
        throw new OperationError("Invalid Base45 input length.");
      }
    }

    return result;
  }
}

export default FromBase45;
