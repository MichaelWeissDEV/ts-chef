/**
 * @fileoverview BcryptCompare operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import bcrypt from "bcryptjs";

/**
 * Bcrypt compare operation
 *
 * @category Crypto
 * @see {@link Bcrypt}
 * @see {@link BcryptParse}
 */
export class BcryptCompare extends TypedOperation<string, Promise<string>, unknown[]> {
  /**
   * BcryptCompare constructor
   */
  constructor() {
    super();

    this.name = "Bcrypt compare";
    this.module = "Crypto";
    this.description =
      "Tests whether the input matches the given bcrypt hash. To test multiple possible passwords, use the 'Fork' operation.";
    this.infoURL = "https://wikipedia.org/wiki/Bcrypt";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Hash",
        type: "string",
        value: "",
      },
    ];
  }

  /**
   * Runs the Bcrypt compare operation.
   *
   * @param {string} input - The password to check.
   * @param {any[]} args - The operation arguments.
   * @param {string} args[0] - The bcrypt hash to compare against.
   * @returns {Promise<string>} A message indicating whether the password matches the hash.
   */
  async run(input: string, args: unknown[]): Promise<string> {
    const hash = args[0];
    const match = await bcrypt.compare(input, hash);
    return match ? "Match: " + input : "No match";
  }
}

export default BcryptCompare;
