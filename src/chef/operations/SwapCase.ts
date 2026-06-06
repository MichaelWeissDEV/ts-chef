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

import { Operation, HighlightPos, HighlightResult } from "../Operation";

export class SwapCase extends Operation {
  constructor() {
    super();
    this.name = "Swap case";
    this.module = "Default";
    this.description =
      "Converts uppercase letters to lowercase ones, and lowercase ones to uppercase ones.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  run(input: string, _args: unknown[]): string {
    let result = "";
    for (let i = 0; i < input.length; i++) {
      const c = input.charAt(i);
      const upper = c.toUpperCase();
      result += c === upper ? c.toLowerCase() : upper;
    }
    return result;
  }

  highlight(pos: HighlightPos, _args: unknown[]): HighlightResult {
    return pos;
  }

  highlightReverse(pos: HighlightPos, _args: unknown[]): HighlightResult {
    return pos;
  }
}

export default SwapCase;
