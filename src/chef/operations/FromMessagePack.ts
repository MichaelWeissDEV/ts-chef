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
import OperationError from "../errors/OperationError";
import notepack from "notepack.io";

/**
 * From MessagePack operation
 */
export class FromMessagePack extends Operation {
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
  run(input: any, args: any[]): any {
    try {
      const buf = Buffer.from(new Uint8Array(input));
      return notepack.decode(buf);
    } catch (err) {
      throw new OperationError(`Could not decode MessagePack to JSON: ${err}`);
    }
  }
}

export default FromMessagePack;
