/**
 * @fileoverview Argon2 operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import Utils from "../Utils";
import * as argon2 from "argon2";

/**
 * Argon2 operation
 *
 * @category Crypto
 * @see https://wikipedia.org/wiki/Argon2
 */
interface ToggleStringArg {
  string: string;
  option: string;
}

export class Argon2 extends Operation {
  /**
   * Argon2 constructor
   */
  constructor() {
    super();

    this.name = "Argon2";
    this.module = "Crypto";
    this.description =
      "Argon2 is a key derivation function that was selected as the winner of the Password Hashing Competition in July 2015. It was designed by Alex Biryukov, Daniel Dinu, and Dmitry Khovratovich from the University of Luxembourg.<br><br>Enter the password in the input to generate its hash.";
    this.infoURL = "https://wikipedia.org/wiki/Argon2";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Salt",
        type: "toggleString",
        value: "somesalt",
        toggleValues: ["UTF8", "Hex", "Base64", "Latin1"],
      },
      {
        name: "Iterations",
        type: "number",
        value: 3,
      },
      {
        name: "Memory (KiB)",
        type: "number",
        value: 4096,
      },
      {
        name: "Parallelism",
        type: "number",
        value: 1,
      },
      {
        name: "Hash length (bytes)",
        type: "number",
        value: 32,
      },
      {
        name: "Type",
        type: "option",
        value: ["Argon2i", "Argon2d", "Argon2id"],
        defaultIndex: 0,
      },
      {
        name: "Output format",
        type: "option",
        value: ["Encoded hash", "Hex hash", "Raw hash"],
      },
    ];
  }

  /**
   * Runs the Argon2 operation.
   *
   * @param {string} input - The password to hash.
   * @param {any[]} args - The operation arguments.
   * @returns {Promise<string>} The generated hash.
   * @throws {OperationError} If hashing fails.
   */
  async run(input: string, args: unknown[]): Promise<string> {
    const argon2Types: Record<string, 0 | 1 | 2> = {
      Argon2i: argon2.argon2i,
      Argon2d: argon2.argon2d,
      Argon2id: argon2.argon2id,
    };

    const [saltArg, time, mem, parallelism, hashLen, typeName, outFormat] =
      args as [ToggleStringArg, number, number, number, number, string, string];
    const salt = Buffer.from(
        Utils.convertToByteString(saltArg.string || "", saltArg.option),
        "latin1",
      ),
      type = argon2Types[typeName];

    try {
      const options = {
        salt: salt,
        timeCost: time,
        memoryCost: mem,
        parallelism: parallelism,
        hashLength: hashLen,
        type: type,
        raw: outFormat === "Raw hash" || outFormat === "Hex hash",
      };

      const result = await argon2.hash(input, options);

      if (typeof result === "string") {
        return result;
      } else {
        const buffer = result as Buffer;
        if (outFormat === "Hex hash") {
          return buffer.toString("hex");
        }
        return buffer.toString("latin1");
      }
    } catch (err) {
      throw new OperationError(
        `Error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}

export default Argon2;
