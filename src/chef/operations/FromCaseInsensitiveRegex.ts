/**
 * @fileoverview FromCaseInsensitiveRegex operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, AnyInput } from "../Operation";

/**
 * From Case Insensitive Regex operation
 */
export class FromCaseInsensitiveRegex extends Operation {
  /**
   * FromCaseInsensitiveRegex constructor
   */
  constructor() {
    super();

    this.name = "From Case Insensitive Regex";
    this.module = "Default";
    this.description =
      "Converts a case-insensitive regex string to a case sensitive regex string (no guarantee on it being the proper original casing) in case the i flag wasn't available at the time but now is, or you need it to be case-sensitive again.<br><br>e.g. <code>[mM][oO][zZ][iI][lL][lL][aA]/[0-9].[0-9] .*</code> becomes <code>Mozilla/[0-9].[0-9] .*</code>";
    this.infoURL = "https://wikipedia.org/wiki/Regular_expression";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, _args: unknown[]): AnyInput {
    return input.replace(/\[[a-z]{2}\]/gi, (m: string) =>
      m[1].toUpperCase() === m[2].toUpperCase() ? m[1] : m,
    );
  }
}

export default FromCaseInsensitiveRegex;
