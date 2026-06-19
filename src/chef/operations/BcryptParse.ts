/**
 * @fileoverview BcryptParse operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import OperationError from "../errors/OperationError";
import bcrypt from "bcryptjs";

/**
 * Bcrypt parse operation
 *
 * @category Crypto
 * @see {@link Bcrypt}
 * @see {@link BcryptCompare}
 */
export class BcryptParse extends TypedOperation<string, Promise<string>, unknown[]> {
  /**
   * BcryptParse constructor
   */
  constructor() {
    super();

    this.name = "Bcrypt parse";
    this.module = "Crypto";
    this.description =
      "Parses a bcrypt hash to determine the number of rounds used, the salt, and the password hash.";
    this.infoURL = "https://wikipedia.org/wiki/Bcrypt";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * Runs the Bcrypt parse operation.
   *
   * @param {string} input - The bcrypt hash to parse.
   * @param {any[]} _args - The operation arguments (none).
   * @returns {Promise<string>} A string containing the parsed information (rounds, salt, password hash).
   */
  async run(input: string, _args: unknown[]): Promise<string> {
    try {
      const rounds = bcrypt.getRounds(input);
      const salt = bcrypt.getSalt(input);
      const hash = input.split(salt)[1];

      return `Rounds: ${rounds}
Salt: ${salt}
Password hash: ${hash}
Full hash: ${input}`;
    } catch (err) {
      throw new OperationError("Error: " + (err as any).toString());
    }
  }
}

export default BcryptParse;
