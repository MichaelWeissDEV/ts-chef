/**
 * @fileoverview ExtractEmailAddresses operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, AnyInput } from "../Operation";
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
  run(input: string, args: unknown[]): AnyInput {
    const [displayTotal, sort, unique] = args as [boolean, boolean, boolean],
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
