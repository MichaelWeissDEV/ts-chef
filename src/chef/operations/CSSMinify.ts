/**
 * @fileoverview CSSMinify operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, ArgConfig } from "../Operation";
import vkbeautify from "vkbeautify";

/**
 * CSS Minify operation
 *
 * @category Code
 */
export class CSSMinify extends Operation {
  name = "CSS Minify";
  module = "Code";
  description = "Compresses Cascading Style Sheets (CSS) code.";
  inputType = "string";
  outputType = "string";
  args: ArgConfig[] = [
    {
      name: "Preserve comments",
      type: "boolean",
      value: false,
    },
  ];

  /**
   * Runs the CSS Minify operation.
   *
   * @param {string} input
   * @param {any[]} args
   * @returns {string}
   */
  run(input: string, args: unknown[]): string {
    const preserveComments = args[0];
    return vkbeautify.cssmin(input, preserveComments);
  }
}

export default CSSMinify;
