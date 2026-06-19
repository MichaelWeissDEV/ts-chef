/**
 * @fileoverview Whirlpool operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";
import { OperationError } from "../errors/OperationError";
import { whirlpool } from "hash-wasm";

export class Whirlpool extends TypedOperation<ArrayBuffer, Promise<string>, unknown[]> {
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
