/**
 * @fileoverview CetaceanCipherEncode operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";
import { toBinary } from "../lib/Binary";

/**
 * Cetacean Cipher Encode operation
 *
 * @category Ciphers
 * @see CetaceanCipherDecode
 */
export class CetaceanCipherEncode extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "Cetacean Cipher Encode";
    this.module = "Ciphers";
    this.description =
      "Converts any input into Cetacean Cipher. e.g. hi becomes EEEEEEEEEeeEeEEEEEEEEEEEEeeEeEEe";
    this.infoURL = "https://hitchhikers.fandom.com/wiki/Dolphins";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * Runs the Cetacean Cipher Encode operation.
   *
   * @param {string} input - The plaintext string to encode.
   * @param {unknown[]} _args - Unused arguments.
   * @returns {string} - The Cetacean Cipher encoded string.
   */
  run(input: string, _args: unknown[]): string {
    const result: string[] = [];

    for (const character of input) {
      if (character === " ") {
        result.push(character);
      } else {
        const binaryStr = toBinary(character.charCodeAt(0), "None", 16);
        result.push(
          binaryStr
            .split("")
            .map((b) => (b === "1" ? "e" : "E"))
            .join(""),
        );
      }
    }

    return result.join("");
  }
}

export default CetaceanCipherEncode;
