/**
 * @fileoverview Argon2Compare operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import Operation from "../Operation";
import * as argon2 from "argon2";

/**
 * Argon2 compare operation
 *
 * @category Crypto
 * @see https://wikipedia.org/wiki/Argon2
 */
export class Argon2Compare extends Operation {
  /**
   * Argon2Compare constructor
   */
  constructor() {
    super();

    this.name = "Argon2 compare";
    this.module = "Crypto";
    this.description =
      "Tests whether the input matches the given Argon2 hash. To test multiple possible passwords, use the 'Fork' operation.";
    this.infoURL = "https://wikipedia.org/wiki/Argon2";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Encoded hash",
        type: "string",
        value: "",
      },
    ];
  }

  /**
   * Runs the Argon2 compare operation.
   *
   * @param {string} input - The password to verify.
   * @param {any[]} args - The operation arguments.
   * @returns {Promise<string>} A string indicating whether it's a match.
   */
  async run(input: string, args: unknown[]): Promise<string> {
    const encoded = args[0] as string;

    try {
      const match = await argon2.verify(encoded, input);

      if (match) {
        return `Match: ${input}`;
      } else {
        return "No match";
      }
    } catch {
      return "No match";
    }
  }
}

export default Argon2Compare;
