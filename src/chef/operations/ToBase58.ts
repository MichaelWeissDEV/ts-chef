/**
 * @fileoverview ToBase58 operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import OperationError from "../errors/OperationError";

const ALPHABET_BITCOIN =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const ALPHABET_RIPPLE =
  "rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz";

/**
 * To Base58 operation
 */
export class ToBase58 extends TypedOperation<ArrayBuffer, string, unknown[]> {
  /**
   * ToBase58 constructor
   */
  constructor() {
    super();
    this.name = "To Base58";
    this.module = "Default";
    this.description = "Base58 encodes data using the specified alphabet.";
    this.infoURL = "https://wikipedia.org/wiki/Base58";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [{ name: "Alphabet", type: "string", value: ALPHABET_BITCOIN }];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: ArrayBuffer, args: unknown[]): string {
    let alphabet = (args[0] as string) || ALPHABET_BITCOIN;
    if (alphabet === "Bitcoin") alphabet = ALPHABET_BITCOIN;
    if (alphabet === "Ripple") alphabet = ALPHABET_RIPPLE;
    if (alphabet.length !== 58 || new Set(alphabet).size !== 58)
      throw new OperationError(
        "Base58 alphabet must contain exactly 58 unique characters.",
      );

    const bytes = Array.from(new Uint8Array(input));
    if (bytes.length === 0) return "";

    let leading = 0;
    for (const b of bytes) {
      if (b === 0) leading++;
      else break;
    }

    const digits: number[] = [0];
    for (const byte of bytes) {
      let carry = byte;
      for (let i = 0; i < digits.length; i++) {
        carry += digits[i] * 256;
        digits[i] = carry % 58;
        carry = (carry / 58) | 0;
      }
      while (carry > 0) {
        digits.push(carry % 58);
        carry = (carry / 58) | 0;
      }
    }

    const encodedValue =
      leading === bytes.length
        ? ""
        : digits
            .reverse()
            .map((d) => alphabet[d])
            .join("");

    return alphabet[0].repeat(leading) + encodedValue;
  }
}

export {
  ALPHABET_BITCOIN as ALPHABET_BITCOIN_B58,
  ALPHABET_RIPPLE as ALPHABET_RIPPLE_B58,
};
export default ToBase58;
