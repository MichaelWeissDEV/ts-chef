/**
 * @fileoverview Scrypt operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import scryptsy from "scryptsy";
import { Operation } from "../Operation";
import { Utils } from "../Utils";
import { OperationError } from "../errors/OperationError";

export class Scrypt extends Operation {
  constructor() {
    super();
    this.name = "Scrypt";
    this.module = "Crypto";
    this.description =
      "scrypt is a password-based key derivation function (PBKDF) created by Colin Percival, designed to make large-scale custom hardware attacks costly.";
    this.infoURL = "https://wikipedia.org/wiki/Scrypt";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Salt",
        type: "toggleString",
        value: "",
        toggleValues: ["Hex", "Base64", "UTF8", "Latin1"],
      },
      { name: "Iterations (N)", type: "number", value: 16384 },
      { name: "Memory factor (r)", type: "number", value: 8 },
      { name: "Parallelization factor (p)", type: "number", value: 1 },
      { name: "Key length", type: "number", value: 64 },
    ];
  }

  run(input: string, args: unknown[]): string {
    const saltArg = args[0] as { string: string; option: string };
    const iterations = args[1] as number;
    const memFactor = args[2] as number;
    const parallelFactor = args[3] as number;
    const keyLength = args[4] as number;

    const salt = Buffer.from(
      Utils.convertToByteArray(saltArg.string || "", saltArg.option),
    );

    try {
      const data = scryptsy(
        input,
        salt,
        iterations,
        memFactor,
        parallelFactor,
        keyLength,
      );
      return (data as Buffer).toString("hex");
    } catch (err) {
      throw new OperationError("Error: " + String(err));
    }
  }
}

export default Scrypt;
