/**
 * @fileoverview BSONDeserialise operation - Ported from GCHQ's CyberChef
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
 * BSON deserialise operation
 *
 * @category Serialise
 * @see https://wikipedia.org/wiki/BSON
 */
export class BSONDeserialise extends TypedOperation<ArrayBuffer, string, unknown[]> {
  /**
   * BSONDeserialise constructor
   */
  constructor() {
    super();

    this.name = "BSON deserialise";
    this.module = "Serialise";
    this.description =
      "BSON is a computer data interchange format used mainly as a data storage and network transfer format in the MongoDB database. It is a binary form for representing simple data structures, associative arrays (called objects or documents in MongoDB), and various data types of specific interest to MongoDB. The name 'BSON' is based on the term JSON and stands for 'Binary JSON'.<br><br>Input data should be in a raw bytes format.";
    this.infoURL = "https://wikipedia.org/wiki/BSON";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * Runs the operation.
   *
   * @param {ArrayBuffer} input
   * @param {any[]} _args
   * @returns {string}
   */
  run(input: ArrayBuffer, _args: unknown[]): string {
    if (!input.byteLength) return "";

    try {
      const data = bson.deserialize(Buffer.from(input));
      return JSON.stringify(data, null, 2);
    } catch (err) {
      throw new OperationError(String(err));
    }
  }
}

export default BSONDeserialise;
