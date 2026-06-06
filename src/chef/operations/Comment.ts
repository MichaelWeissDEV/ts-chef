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
  run(input: string, _args: any[]): string {
    return input;
  }
}

export default Comment;
