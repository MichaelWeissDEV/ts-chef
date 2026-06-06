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

/**
 * Extract dates operation
 */
export class ExtractDates extends Operation {
  /**
   * ExtractDates constructor
   */
  constructor() {
    super();

    this.name = "Extract dates";
    this.module = "Regex";
    this.description =
      "Extracts dates in the following formats<ul><li><code>yyyy-mm-dd</code></li><li><code>dd/mm/yyyy</code></li><li><code>mm/dd/yyyy</code></li></ul>Dividers can be any of /, -, . or space";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Display total",
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
    const displayTotal = args[0],
      date1 =
        "(?:19|20)\\d\\d[- /.](?:0[1-9]|1[012])[- /.](?:0[1-9]|[12][0-9]|3[01])", // yyyy-mm-dd
      date2 =
        "(?:0[1-9]|[12][0-9]|3[01])[- /.](?:0[1-9]|1[012])[- /.](?:19|20)\\d\\d", // dd/mm/yyyy
      date3 =
        "(?:0[1-9]|1[012])[- /.](?:0[1-9]|[12][0-9]|3[01])[- /.](?:19|20)\\d\\d", // mm/dd/yyyy
      regex = new RegExp(date1 + "|" + date2 + "|" + date3, "ig");

    const results = search(input, regex);

    if (displayTotal) {
      return `Total found: ${results.length}\n\n${results.join("\n")}`;
    } else {
      return results.join("\n");
    }
  }
}

export default ExtractDates;
