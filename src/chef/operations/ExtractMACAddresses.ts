/**
 * @fileoverview ExtractMACAddresses operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import { search } from "../lib/Extract";
import { hexadecimalSort } from "../lib/Sort";

/**
 * Extract MAC addresses operation
 */
export class ExtractMACAddresses extends TypedOperation<string, AnyInput, unknown[]> {
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
  run(input: string, args: unknown[]): AnyInput {
    const [displayTotal, sort, unique] = args as [boolean, boolean, boolean],
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
