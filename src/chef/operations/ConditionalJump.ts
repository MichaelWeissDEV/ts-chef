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

/**
 * Conditional Jump operation
 *
 * @category Default
 */
export class ConditionalJump extends Operation {
  name = "Conditional Jump";
  module = "Default";
  description =
    "Conditionally jump forwards or backwards to the specified Label based on whether the data matches the specified regular expression.";
  inputType = "string";
  outputType = "string";
  flowControl = true;
  args: ArgConfig[] = [
    {
      name: "Match (regex)",
      type: "string",
      value: "",
    },
    {
      name: "Invert match",
      type: "boolean",
      value: false,
    },
    {
      name: "Label name",
      type: "shortString",
      value: "",
    },
    {
      name: "Maximum jumps (if jumping backwards)",
      type: "number",
      value: 10,
    },
  ];

  /**
   * @param {string} input
   * @param {any[]} _args
   * @returns {string}
   */
  run(input: string, _args: any[]): string {
    return input;
  }
}

export default ConditionalJump;
