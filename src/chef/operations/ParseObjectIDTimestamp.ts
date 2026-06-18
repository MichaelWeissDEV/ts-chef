/**
 * @fileoverview ParseObjectIDTimestamp operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, AnyInput } from "../Operation";
import OperationError from "../errors/OperationError";
import * as BSON from "bson";

/**
 * Parse ObjectID timestamp operation
 */
export class ParseObjectIDTimestamp extends Operation {
  /**
   * ParseObjectIDTimestamp constructor
   */
  constructor() {
    super();

    this.name = "Parse ObjectID timestamp";
    this.module = "Serialise";
    this.description = "Parse timestamp from MongoDB/BSON ObjectID hex string.";
    this.infoURL =
      "https://docs.mongodb.com/manual/reference/method/ObjectId.getTimestamp/";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, _args: unknown[]): string {
    try {
      const objectId = new BSON.ObjectId(input);
      return objectId.getTimestamp().toISOString();
    } catch (err) {
      throw new OperationError(err);
    }
  }
}

export default ParseObjectIDTimestamp;
