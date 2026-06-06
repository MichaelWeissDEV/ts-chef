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
import { EMAIL_REGEX, search } from "../lib/Extract";
import { caseInsensitiveSort } from "../lib/Sort";

/**
 * Extract email addresses operation
 */
export class ExtractEmailAddresses extends Operation {
  /**
   * ExtractEmailAddresses constructor
   */
  constructor() {
    super();

    this.name = "Extract email addresses";
    this.module = "Regex";
    this.description = "Extracts all email addresses from the input.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Display total",
        type: "boolean",
        value: false,
      },
      {
        name: "Sort",
        type: "boolean",
        value: false,
      },
      {
        name: "Unique",
        type: "boolean",
        value: false,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const [displayTotal, sort, unique] = args,
      regex = EMAIL_REGEX;

    const results = search(
      input,
      regex,
      null,
      sort ? caseInsensitiveSort : null,
      unique,
    );

    if (displayTotal) {
      return `Total found: ${results.length}\n\n${results.join("\n")}`;
    } else {
      return results.join("\n");
    }
  }
}

export default ExtractEmailAddresses;
