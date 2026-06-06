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

import jsonata from "jsonata";
import { Operation } from "../Operation";
import OperationError from "../errors/OperationError";

/**
 * Jsonata Query operation
 */
export class JsonataQuery extends Operation {
  /**
   * JsonataQuery constructor
   */
  constructor() {
    super();

    this.name = "Jsonata Query";
    this.module = "Code";
    this.description = "Query and transform JSON data with a jsonata query.";
    this.infoURL = "https://docs.jsonata.org/overview.html";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Query",
        type: "text",
        value: "string",
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  async run(input: any, args: any[]): Promise<any> {
    const [query] = args;
    let result, jsonObj;

    try {
      jsonObj = JSON.parse(input);
    } catch (err) {
      throw new OperationError(
        `Invalid input JSON: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    try {
      const expression = jsonata(query);
      result = await expression.evaluate(jsonObj);
    } catch (err) {
      throw new OperationError(
        `Invalid Jsonata Expression: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return JSON.stringify(result === undefined ? "" : result);
  }
}

export default JsonataQuery;
