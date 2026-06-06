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

import { Operation } from "../Operation";
import { OperationError } from "../errors/OperationError";
import { whirlpool } from "hash-wasm";

export class Whirlpool extends Operation {
  constructor() {
    super();
    this.name = "Whirlpool";
    this.module = "Hashing";
    this.description =
      "Whirlpool is a cryptographic hash function designed by Vincent Rijmen and Paulo S. L. M. Barreto.";
    this.infoURL = "https://wikipedia.org/wiki/Whirlpool_(hash_function)";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [];
  }

  async run(input: ArrayBuffer, _args: unknown[]): Promise<string> {
    try {
      return await whirlpool(new Uint8Array(input));
    } catch (err) {
      throw new OperationError("Whirlpool error: " + String(err));
    }
  }
}

export default Whirlpool;
