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
import OperationError from "../errors/OperationError";
import { ALPHABET_BITCOIN_B58, ALPHABET_RIPPLE_B58 } from "./ToBase58";

/**
 * From Base58 operation
 */
export class FromBase58 extends Operation {
  /**
   * FromBase58 constructor
   */
  constructor() {
    super();
    this.name = "From Base58";
    this.module = "Default";
    this.description = "Base58 decodes data from the specified alphabet.";
    this.infoURL = "https://wikipedia.org/wiki/Base58";
    this.inputType = "string";
    this.outputType = "byteArray";
    this.args = [
      { name: "Alphabet", type: "string", value: ALPHABET_BITCOIN_B58 },
      { name: "Remove non-alphabet chars", type: "boolean", value: true },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {number[]}
   */
  run(input: string, args: unknown[]): number[] {
    let alphabet = (args[0] as string) || ALPHABET_BITCOIN_B58;
    if (alphabet === "Bitcoin") alphabet = ALPHABET_BITCOIN_B58;
    if (alphabet === "Ripple") alphabet = ALPHABET_RIPPLE_B58;

    const removeNonAlpha = (args[1] as boolean) ?? true;

    const map = new Map<string, number>();
    for (let i = 0; i < alphabet.length; i++) map.set(alphabet[i], i);

    let cleaned = input.trim();
    if (removeNonAlpha) {
      cleaned = cleaned
        .split("")
        .filter((c) => map.has(c))
        .join("");
    }

    if (!cleaned) throw new OperationError("No valid Base58 input found.");

    let leading = 0;
    for (const ch of cleaned) {
      if (ch === alphabet[0]) leading++;
      else break;
    }

    const result: number[] = [0];
    for (const ch of cleaned) {
      const val = map.get(ch);
      if (val === undefined)
        throw new OperationError(`Invalid Base58 character: '${ch}'`);
      let carry = val;
      for (let i = 0; i < result.length; i++) {
        carry += result[i] * 58;
        result[i] = carry & 0xff;
        carry >>= 8;
      }
      while (carry > 0) {
        result.push(carry & 0xff);
        carry >>= 8;
      }
    }

    while (result.length > 1 && result[result.length - 1] === 0) result.pop();
    result.reverse();

    return new Array(leading).fill(0).concat(result);
  }
}

export default FromBase58;
