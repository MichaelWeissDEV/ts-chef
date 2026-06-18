/**
 * @fileoverview Comment operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, ArgConfig } from "../Operation";

/**
 * Comment operation
 *
 * @category Default
 */
export class Comment extends Operation {
  name = "Comment";
  module = "Default";
  description =
    "Provides a place to write comments within the flow of the recipe. This operation has no computational effect.";
  inputType = "string";
  outputType = "string";
  flowControl = true;
  args: ArgConfig[] = [
    {
      name: "Comment",
      type: "text",
      value: "",
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

export default Comment;
