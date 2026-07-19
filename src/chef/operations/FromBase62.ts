/**
 * @fileoverview FromBase62 operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import { Utils } from "../Utils";
import { BASE62_ALPHABET } from "./ToBase62";
import OperationError from "../errors/OperationError";

/**
 * From Base62 operation
 */
export class FromBase62 extends TypedOperation<string, number[], unknown[]> {
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
    if (base < 2 || new Set(alphabet).size !== base)
      throw new OperationError(
        "Base62 alphabet must contain at least 2 unique characters.",
      );

    const map = new Map<string, number>();
    for (let i = 0; i < alphabet.length; i++) map.set(alphabet[i], i);

    const cleaned = input.trim();
    if (!cleaned) return [];

    let leading = 0;
    for (const ch of cleaned) {
      if (ch === alphabet[0]) leading++;
      else break;
    }

    const encodedValue = cleaned.slice(leading);
    if (!encodedValue) return new Array(leading).fill(0);

    const result: number[] = [0];
    for (const ch of encodedValue) {
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
    return new Array(leading).fill(0).concat(result);
  }
}

export default FromBase62;
