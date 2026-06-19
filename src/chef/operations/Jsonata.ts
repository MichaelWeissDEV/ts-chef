/**
 * @fileoverview Jsonata operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import jsonata from "jsonata";
import { TypedOperation, AnyInput } from "../Operation_new";
import OperationError from "../errors/OperationError";

/**
 * Jsonata Query operation
 */
export class JsonataQuery extends TypedOperation<string, Promise<AnyInput>, unknown[]> {
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
  async run(input: string, args: unknown[]): Promise<AnyInput> {
    const [query] = args as [string];
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
