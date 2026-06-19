/**
 * @fileoverview Bcrypt operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import bcrypt from "bcryptjs";

/**
 * Bcrypt operation
 *
 * @category Crypto
 * @see {@link BcryptCompare}
 * @see {@link BcryptParse}
 */
export class Bcrypt extends TypedOperation<string, Promise<string>, unknown[]> {
  /**
   * Bcrypt constructor
   */
  constructor() {
    super();

    this.name = "Bcrypt";
    this.module = "Crypto";
    this.description =
      "bcrypt is a password hashing function designed by Niels Provos and David Mazières, based on the Blowfish cipher, and presented at USENIX in 1999. Besides incorporating a salt to protect against rainbow table attacks, bcrypt is an adaptive function: over time, the iteration count (rounds) can be increased to make it slower, so it remains resistant to brute-force search attacks even with increasing computation power.<br><br>Enter the password in the input to generate its hash.";
    this.infoURL = "https://wikipedia.org/wiki/Bcrypt";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Rounds",
        type: "number",
        value: 10,
      },
    ];
  }

  /**
   * Runs the Bcrypt operation.
   *
   * @param {string} input - The password to hash.
   * @param {any[]} args - The operation arguments.
   * @param {number} args[0] - The number of rounds to use for salt generation.
   * @returns {Promise<string>} The generated bcrypt hash.
   */
  async run(input: string, args: unknown[]): Promise<string> {
    const rounds = args[0];
    const salt = await bcrypt.genSalt(rounds);
    return await bcrypt.hash(input, salt);
  }
}

export default Bcrypt;
