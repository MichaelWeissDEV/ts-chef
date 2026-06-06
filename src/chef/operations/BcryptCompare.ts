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

import Operation from "../Operation";
import bcrypt from "bcryptjs";

/**
 * Bcrypt compare operation
 *
 * @category Crypto
 * @see {@link Bcrypt}
 * @see {@link BcryptParse}
 */
export class BcryptCompare extends Operation {
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
  async run(input: string, args: any[]): Promise<string> {
    const hash = args[0];
    const match = await bcrypt.compare(input, hash);
    return match ? "Match: " + input : "No match";
  }
}

export default BcryptCompare;
