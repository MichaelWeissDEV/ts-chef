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
 * To MessagePack operation
 */
export class ToMessagePack extends Operation {
  /**
   * ToMessagePack constructor
   */
  constructor() {
    super();

    this.name = "To MessagePack";
    this.module = "Code";
    this.description =
      "Converts JSON to MessagePack encoded byte buffer. MessagePack is a computer data interchange format. It is a binary form for representing simple data structures like arrays and associative arrays.";
    this.infoURL = "https://wikipedia.org/wiki/MessagePack";
    this.inputType = "JSON";
    this.outputType = "ArrayBuffer";
    this.args = [];
  }

  /**
   * @param {JSON} input
   * @param {Object[]} args
   * @returns {ArrayBuffer}
   */
  run(input: any, args: any[]): any {
    try {
      const res = notepack.encode(input);
      // Safely convert from Node Buffer to ArrayBuffer using the correct view of the data
      return new Uint8Array(res).buffer;
    } catch (err) {
      throw new OperationError(`Could not encode JSON to MessagePack: ${err}`);
    }
  }
}

export default ToMessagePack;
