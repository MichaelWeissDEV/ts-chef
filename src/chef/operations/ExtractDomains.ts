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
import { search, DOMAIN_REGEX, DMARC_DOMAIN_REGEX } from "../lib/Extract";
import { caseInsensitiveSort } from "../lib/Sort";

/**
 * Extract domains operation
 */
export class ExtractDomains extends Operation {
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
  run(input: any, args: any[]): any {
    const [displayTotal, sort, unique, dmarc] = args;

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
