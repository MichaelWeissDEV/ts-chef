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
  run(input: any, args: any[]): any {
    const [query, raw] = args;
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
