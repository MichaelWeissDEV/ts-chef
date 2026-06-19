/**
 * @fileoverview ExtractDomains operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import { search, DOMAIN_REGEX, DMARC_DOMAIN_REGEX } from "../lib/Extract";
import { caseInsensitiveSort } from "../lib/Sort";

/**
 * Extract domains operation
 */
export class ExtractDomains extends TypedOperation<string, AnyInput, unknown[]> {
  /**
   * ExtractDomains constructor
   */
  constructor() {
    super();

    this.name = "Extract domains";
    this.module = "Regex";
    this.description =
      "Extracts fully qualified domain names.<br>Note that this will not include paths. Use <strong>Extract URLs</strong> to find entire URLs.";
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
      {
        name: "Underscore (DMARC, DKIM, etc)",
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
    const [displayTotal, sort, unique, dmarc] = args as [
      boolean,
      boolean,
      boolean,
      boolean,
    ];

    const results = search(
      input,
      dmarc ? DMARC_DOMAIN_REGEX : DOMAIN_REGEX,
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

export default ExtractDomains;
