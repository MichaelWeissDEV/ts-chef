/**
 * @fileoverview Jq operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, AnyInput } from "../Operation";
import OperationError from "../errors/OperationError";
import jq from "jq-web";

/**
 * jq operation
 */
export class Jq extends Operation {
  /**
   * Jq constructor
   */
  constructor() {
    super();

    this.name = "Jq";
    this.module = "Jq";
    this.description =
      "jq is a lightweight and flexible command-line JSON processor.";
    this.infoURL = "https://github.com/jqlang/jq";
    this.inputType = "JSON";
    this.outputType = "string";
    this.args = [
      {
        name: "Query",
        type: "string",
        value: "",
      },
      {
        name: "Raw",
        type: "boolean",
        value: false,
      },
    ];
  }

  /**
   * @param {JSON} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: AnyInput, args: unknown[]): AnyInput {
    const [query, raw] = args as [string, boolean];
    let result;

    try {
      result = jq.json(input, query);
    } catch (err) {
      throw new OperationError(
        `Invalid jq expression: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    if (raw && typeof result === "string") {
      return result;
    } else {
      return JSON.stringify(result);
    }
  }
}

export default Jq;
