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

import { Operation, ArgConfig } from "../Operation";
const vkbeautify = require("vkbeautify");

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
  run(input: string, args: any[]): string {
    const preserveComments = args[0];
    return vkbeautify.cssmin(input, preserveComments);
  }
}

export default CSSMinify;
