/**
 * @fileoverview ToBase62 operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import { Utils } from "../Utils";
import OperationError from "../errors/OperationError";

const BASE62_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/**
 * To Base62 operation
 */
export class ToBase62 extends TypedOperation<ArrayBuffer, string, unknown[]> {
  /**
   * ToBase62 constructor
   */
  constructor() {
    super();
    this.name = "To Base62";
    this.module = "Default";
    this.description =
      "Base62 encodes data using digits and letters without special characters.";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [{ name: "Alphabet", type: "string", value: BASE62_ALPHABET }];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: ArrayBuffer, args: unknown[]): string {
    const alphabetStr = (args[0] as string) || BASE62_ALPHABET;
    const alphabet = Utils.expandAlphRange(alphabetStr).join("");
    const base = alphabet.length;
    const bytes = new Uint8Array(input);
    if (base < 2 || new Set(alphabet).size !== base)
      throw new OperationError(
        "Base62 alphabet must contain at least 2 unique characters.",
      );
    if (bytes.length === 0) return "";

    let leading = 0;
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] === 0) leading++;
      else break;
    }

    const digits: number[] = [0];
    for (let i = 0; i < bytes.length; i++) {
      let carry = bytes[i];
      for (let j = 0; j < digits.length; j++) {
        carry += digits[j] * 256;
        digits[j] = carry % base;
        carry = (carry / base) | 0;
      }
      while (carry > 0) {
        digits.push(carry % base);
        carry = (carry / base) | 0;
      }
    }

    let res = alphabet[0].repeat(leading);
    if (leading < bytes.length) {
      for (let i = digits.length - 1; i >= 0; i--) res += alphabet[digits[i]];
    }

    return res;
  }
}

export default ToBase62;
export { BASE62_ALPHABET };
