/**
 * @fileoverview Argon2 operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import OperationError from "../errors/OperationError";
import Utils from "../Utils";
import { argon2id, argon2i, argon2d } from "hash-wasm";

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

export class Argon2 extends TypedOperation<string, Promise<string>, unknown[]> {
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
    const argon2Types: Record<string, typeof argon2id> = {
      Argon2i: argon2i,
      Argon2d: argon2d,
      Argon2id: argon2id,
    };

    const [saltArg, time, mem, parallelism, hashLen, typeName, outFormat] =
      args as [ToggleStringArg, number, number, number, number, string, string];

    if (mem < 8) {
      // Argon2 standard requires at least 8 KiB in hash-wasm
      throw new OperationError("Error: memory cost must be at least 8 KiB");
    }

    const saltBytes = Utils.convertToByteArray(saltArg.string || "", saltArg.option);
    const salt = new Uint8Array(saltBytes);
    const type = argon2Types[typeName];
    if (!type) {
      throw new OperationError(`Error: unknown Argon2 type: ${typeName}`);
    }

    try {
      const hashHex = await type({
        password: input,
        salt: salt,
        iterations: time,
        memorySize: mem,
        parallelism: parallelism,
        hashLength: hashLen,
        outputType: "hex",
      });

      if (outFormat === "Hex hash") {
        return hashHex;
      } else if (outFormat === "Raw hash") {
        const buf = Buffer.from(hashHex, "hex");
        return buf.toString("latin1");
      } else {
        // Encoded hash format
        // Base64 encode without padding
        const saltB64 = Buffer.from(salt).toString("base64").replace(/=+$/, "");
        const hashB64 = Buffer.from(hashHex, "hex").toString("base64").replace(/=+$/, "");
        const algorithmName = typeName.toLowerCase(); // argon2i, argon2d, argon2id
        return `$${algorithmName}$v=19$m=${mem},t=${time},p=${parallelism}$${saltB64}$${hashB64}`;
      }
    } catch (err) {
      throw new OperationError(
        `Error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}

export default Argon2;
