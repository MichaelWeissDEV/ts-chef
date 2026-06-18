/**
 * @fileoverview ConditionalJump operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
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
  run(input: string, _args: unknown[]): string {
    return input;
  }
}

export default ConditionalJump;
