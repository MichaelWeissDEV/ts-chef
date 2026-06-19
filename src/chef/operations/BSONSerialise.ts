/**
 * @fileoverview BSONSerialise operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import * as bson from "bson";
import OperationError from "../errors/OperationError";

/**
 * BSON serialise operation
 *
 * @category Serialise
 * @see https://wikipedia.org/wiki/BSON
 */
export class BSONSerialise extends TypedOperation<string, ArrayBuffer, unknown[]> {
  /**
   * BSONSerialise constructor
   */
  constructor() {
    super();

    this.name = "BSON serialise";
    this.module = "Serialise";
    this.description =
      "BSON is a computer data interchange format used mainly as a data storage and network transfer format in the MongoDB database. It is a binary form for representing simple data structures, associative arrays (called objects or documents in MongoDB), and various data types of specific interest to MongoDB. The name 'BSON' is based on the term JSON and stands for 'Binary JSON'.<br><br>Input data should be valid JSON.";
    this.infoURL = "https://wikipedia.org/wiki/BSON";
    this.inputType = "string";
    this.outputType = "ArrayBuffer";
    this.args = [];
  }

  /**
   * Runs the operation.
   *
   * @param {string} input
   * @param {any[]} _args
   * @returns {ArrayBuffer}
   */
  run(input: string, _args: unknown[]): ArrayBuffer {
    if (!input) return new ArrayBuffer(0);

    try {
      const data = JSON.parse(input);
      const buffer = bson.serialize(data);
      return buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
      ) as ArrayBuffer;
    } catch (err) {
      throw new OperationError(err.toString());
    }
  }
}

export default BSONSerialise;
