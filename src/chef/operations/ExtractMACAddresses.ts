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
import { search } from "../lib/Extract";
import { hexadecimalSort } from "../lib/Sort";

/**
 * Extract MAC addresses operation
 */
export class ExtractMACAddresses extends Operation {
  /**
   * ExtractMACAddresses constructor
   */
  constructor() {
    super();

    this.name = "Extract MAC addresses";
    this.module = "Regex";
    this.description =
      "Extracts all Media Access Control (MAC) addresses from the input.";
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
      regex = /[A-F\d]{2}(?:[:-][A-F\d]{2}){5}/gi,
      results = search(
        input,
        regex,
        null,
        sort ? hexadecimalSort : null,
        unique,
      );

    if (displayTotal) {
      return `Total found: ${results.length}\n\n${results.join("\n")}`;
    } else {
      return results.join("\n");
    }
  }
}

export default ExtractMACAddresses;
