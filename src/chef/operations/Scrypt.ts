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

// eslint-disable-next-line @typescript-eslint/no-require-imports
const scryptsy = require("scryptsy");
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
