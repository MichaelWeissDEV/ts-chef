/**
 * @fileoverview CSSBeautify operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, ArgConfig } from "../Operation";
import vkbeautify from "vkbeautify";

/**
 * CSS Beautify operation
 *
 * @category Code
 */
export class CSSBeautify extends Operation {
  name = "CSS Beautify";
  module = "Code";
  description = "Indents and prettifies Cascading Style Sheets (CSS) code.";
  inputType = "string";
  outputType = "string";
  args: ArgConfig[] = [
    {
      name: "Indent string",
      type: "binaryShortString",
      value: "\\t",
    },
  ];

  /**
   * Runs the CSS Beautify operation.
   *
   * @param {string} input
   * @param {any[]} args
   * @returns {string}
   */
  run(input: string, args: unknown[]): string {
    const indentStr = args[0];
    return vkbeautify.css(input, indentStr);
  }
}

export default CSSBeautify;
