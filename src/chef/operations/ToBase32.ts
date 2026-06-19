/**
 * @fileoverview ToBase32 operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";
import { Utils } from "../Utils";

const B32_ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const B32HEX_ALPHA = "0123456789ABCDEFGHIJKLMNOPQRSTUV";

/**
 * To Base32 operation
 */
export class ToBase32 extends TypedOperation<ArrayBuffer, string, unknown[]> {
  /**
   * ToBase32 constructor
   */
  constructor() {
    super();
    this.name = "To Base32";
    this.module = "Default";
    this.description = "Base32 encodes data using the standard alphabet.";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      { name: "Alphabet", type: "string", value: B32_ALPHA },
      { name: "Pad", type: "boolean", value: true },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: ArrayBuffer, args: unknown[]): string {
    const alphabetStr = (args[0] as string) || B32_ALPHA;
    const pad = args[1] as boolean;
    const alphabet = Utils.expandAlphRange(alphabetStr).join("");

    const bytes = new Uint8Array(input);
    let output = "";
    let buffer = 0;
    let bitsLeft = 0;

    for (const byte of bytes) {
      buffer = (buffer << 8) | byte;
      bitsLeft += 8;
      while (bitsLeft >= 5) {
        bitsLeft -= 5;
        output += alphabet[(buffer >>> bitsLeft) & 0x1f];
      }
    }

    if (bitsLeft > 0) {
      output += alphabet[(buffer << (5 - bitsLeft)) & 0x1f];
    }

    if (pad) {
      const padChar = alphabet.length > 32 ? alphabet[32] : "=";
      const padCount = (8 - (output.length % 8)) % 8;
      for (let i = 0; i < padCount; i++) {
        output += padChar;
      }
    }

    return output;
  }
}

export { B32_ALPHA, B32HEX_ALPHA };
export default ToBase32;
