/**
 * @fileoverview JavaScriptParser operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import * as esprima from "esprima";

/**
 * JavaScript Parser operation
 */
export class JavaScriptParser extends TypedOperation<string, string, unknown[]> {
  /**
   * JavaScriptParser constructor
   */
  constructor() {
    super();

    this.name = "JavaScript Parser";
    this.module = "Code";
    this.description =
      "Returns an Abstract Syntax Tree for valid JavaScript code.";
    this.infoURL = "https://wikipedia.org/wiki/Abstract_syntax_tree";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Location info",
        type: "boolean",
        value: false,
      },
      {
        name: "Range info",
        type: "boolean",
        value: false,
      },
      {
        name: "Include tokens array",
        type: "boolean",
        value: false,
      },
      {
        name: "Include comments array",
        type: "boolean",
        value: false,
      },
      {
        name: "Report errors and try to continue",
        type: "boolean",
        value: false,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, args: unknown[]): string {
    const [parseLoc, parseRange, parseTokens, parseComment, parseTolerant] =
        args as [boolean, boolean, boolean, boolean, boolean],
      options = {
        loc: parseLoc,
        range: parseRange,
        tokens: parseTokens,
        comment: parseComment,
        tolerant: parseTolerant,
      };
    const result = esprima.parseScript(input, options);
    return JSON.stringify(result, null, 2);
  }
}

export default JavaScriptParser;
