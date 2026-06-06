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

import { JSONPath } from "jsonpath-plus";
import { Operation } from "../Operation";
import OperationError from "../errors/OperationError";

/**
 * JPath expression operation
 */
export class JPathExpression extends Operation {
  /**
   * JPathExpression constructor
   */
  constructor() {
    super();

    this.name = "JPath expression";
    this.module = "Code";
    this.description =
      "Extract information from a JSON object with a JPath query.";
    this.infoURL = "http://goessner.net/articles/JsonPath/";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Query",
        type: "string",
        value: "",
      },
      {
        name: "Result delimiter",
        type: "binaryShortString",
        value: "\\n",
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const [query, delimiter] = args;
    let results, jsonObj;

    try {
      jsonObj = JSON.parse(input);
    } catch (err) {
      throw new OperationError(
        `Invalid input JSON: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    try {
      results = JSONPath({
        path: query,
        json: jsonObj,
      });
    } catch (err) {
      throw new OperationError(
        `Invalid JPath expression: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return results.map((result) => JSON.stringify(result)).join(delimiter);
  }
}

export default JPathExpression;
