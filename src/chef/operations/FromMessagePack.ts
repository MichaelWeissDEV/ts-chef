/**
 * @fileoverview FromMessagePack operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import OperationError from "../errors/OperationError";
import notepack from "notepack.io";

/**
 * From MessagePack operation
 */
export class FromMessagePack extends TypedOperation<ArrayBuffer, AnyInput, unknown[]> {
  /**
   * FromMessagePack constructor
   */
  constructor() {
    super();

    this.name = "From MessagePack";
    this.module = "Code";
    this.description =
      "Converts MessagePack encoded data to JSON. MessagePack is a computer data interchange format. It is a binary form for representing simple data structures like arrays and associative arrays.";
    this.infoURL = "https://wikipedia.org/wiki/MessagePack";
    this.inputType = "ArrayBuffer";
    this.outputType = "JSON";
    this.args = [];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {JSON}
   */
  run(input: ArrayBuffer, _args: unknown[]): AnyInput {
    try {
      const buf = Buffer.from(new Uint8Array(input));
      return notepack.decode(buf);
    } catch (err) {
      throw new OperationError(`Could not decode MessagePack to JSON: ${err}`);
    }
  }
}

export default FromMessagePack;
