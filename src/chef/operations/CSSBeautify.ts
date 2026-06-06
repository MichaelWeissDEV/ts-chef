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
  run(input: string, args: any[]): string {
    const indentStr = args[0];
    return vkbeautify.css(input, indentStr);
  }
}

export default CSSBeautify;
