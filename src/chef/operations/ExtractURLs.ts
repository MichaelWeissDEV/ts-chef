/**
 * @fileoverview ExtractURLs operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, AnyInput } from "../Operation";
import { search, URL_REGEX } from "../lib/Extract";
import { caseInsensitiveSort } from "../lib/Sort";

/**
 * Extract URLs operation
 */
export class ExtractURLs extends Operation {
  /**
   * ExtractURLs constructor
   */
  constructor() {
    super();

    this.name = "Extract URLs";
    this.module = "Regex";
    this.description =
      "Extracts Uniform Resource Locators (URLs) from the input. The protocol (http, ftp etc.) is required otherwise there will be far too many false positives.";
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
  run(input: string, args: unknown[]): AnyInput {
    const [displayTotal, sort, unique] = args as [boolean, boolean, boolean];
    const results = search(
      input,
      URL_REGEX,
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

export default ExtractURLs;
