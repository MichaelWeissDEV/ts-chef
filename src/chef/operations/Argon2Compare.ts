/**
 * @fileoverview Argon2Compare operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import { argon2id, argon2i, argon2d } from "hash-wasm";

/**
 * Argon2 compare operation
 *
 * @category Crypto
 * @see https://wikipedia.org/wiki/Argon2
 */
export class Argon2Compare extends TypedOperation<string, Promise<string>, unknown[]> {
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
      const parts = encoded.split("$");
      if (parts.length < 6) return "No match";

      const typeName = parts[1]; // argon2i, argon2d, argon2id
      const paramsStr = parts[3]; // m=4096,t=3,p=1
      const saltB64 = parts[4];
      const hashB64 = parts[5];

      const params: Record<string, number> = {};
      paramsStr.split(",").forEach((p) => {
        const [k, v] = p.split("=");
        params[k] = parseInt(v, 10);
      });

      const padBase64 = (str: string) => {
        return str + "=".repeat((4 - (str.length % 4)) % 4);
      };

      const salt = new Uint8Array(Buffer.from(padBase64(saltB64), "base64"));
      const expectedHashHex = Buffer.from(padBase64(hashB64), "base64").toString("hex");

      const argon2Types: Record<string, typeof argon2id> = {
        argon2i: argon2i,
        argon2d: argon2d,
        argon2id: argon2id,
      };

      const type = argon2Types[typeName];
      if (!type) return "No match";

      const computedHex = await type({
        password: input,
        salt: salt,
        iterations: params.t,
        memorySize: params.m,
        parallelism: params.p,
        hashLength: expectedHashHex.length / 2,
        outputType: "hex",
      });

      if (computedHex === expectedHashHex) {
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
