/**
 * @fileoverview JPathExpression operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { JSONPath } from "jsonpath-plus";
import { TypedOperation } from "../Operation_new";
import OperationError from "../errors/OperationError";

/**
 * JPath expression operation
 */
export class JPathExpression extends TypedOperation<string, string, unknown[]> {
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
  run(input: string, args: unknown[]): string {
    const [query, delimiter] = args as [string, string];
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
