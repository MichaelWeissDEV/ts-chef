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
import OperationError from "../errors/OperationError";
import Utils from "../Utils";
import * as argon2 from "argon2";

/**
 * Argon2 operation
 *
 * @category Crypto
 * @see https://wikipedia.org/wiki/Argon2
 */
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
  async run(input: string, args: any[]): Promise<string> {
    const argon2Types: Record<string, number> = {
      Argon2i: argon2.argon2i,
      Argon2d: argon2.argon2d,
      Argon2id: argon2.argon2id,
    };

    const salt = Buffer.from(
        Utils.convertToByteString(args[0].string || "", args[0].option),
        "latin1",
      ),
      time = args[1],
      mem = args[2],
      parallelism = args[3],
      hashLen = args[4],
      type = argon2Types[args[5]],
      outFormat = args[6];

    try {
      const options: any = {
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
    } catch (err: any) {
      throw new OperationError(`Error: ${err.message}`);
    }
  }
}

export default Argon2;
