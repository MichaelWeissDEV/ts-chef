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
  run(input: any, args: any[]): any {
    try {
      const objectId = new BSON.ObjectId(input);
      return objectId.getTimestamp().toISOString();
    } catch (err) {
      throw new OperationError(err);
    }
  }
}

export default ParseObjectIDTimestamp;
