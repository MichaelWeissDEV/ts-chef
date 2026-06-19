/**
 * @fileoverview SwapCase operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, HighlightPos, HighlightResult } from "../Operation";

export class SwapCase extends TypedOperation<string, string, unknown[]> {
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
