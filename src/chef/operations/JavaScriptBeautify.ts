/**
 * @fileoverview JavaScriptBeautify operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import OperationError from "../errors/OperationError";
import escodegen from "escodegen";
import * as esprima from "esprima";

/**
 * JavaScript Beautify operation
 */
export class JavaScriptBeautify extends TypedOperation<
  string,
  string,
  unknown[]
> {
  /**
   * JavaScriptBeautify constructor
   */
  constructor() {
    super();

    this.name = "JavaScript Beautify";
    this.module = "Code";
    this.description =
      "Parses and pretty prints valid JavaScript code. Also works with JavaScript Object Notation (JSON).";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Indent string",
        type: "binaryShortString",
        value: "\\t",
      },
      {
        name: "Quotes",
        type: "option",
        value: ["Auto", "Single", "Double"],
      },
      {
        name: "Semicolons before closing braces",
        type: "boolean",
        value: true,
      },
      {
        name: "Include comments",
        type: "boolean",
        value: true,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, args: unknown[]): string {
    const [indentArg, quotesArg, beautifySemicolons, beautifyComment] =
      args as [string, string, boolean, boolean];
    const beautifyIndent = indentArg || "\\t",
      quotes = quotesArg.toLowerCase();
    let result: string, AST;

    try {
      AST = esprima.parseScript(input, {
        range: true,
        tokens: true,
        comment: true,
      });

      const options = {
        format: {
          indent: {
            style: beautifyIndent,
          },
          quotes: quotes,
          semicolons: beautifySemicolons,
        },
        comment: beautifyComment,
      };

      if (options.comment)
        AST = escodegen.attachComments(
          AST,
          AST.comments || [],
          AST.tokens || [],
        );

      result = escodegen.generate(
        AST,
        options as Parameters<typeof escodegen.generate>[1],
      );
    } catch (e) {
      // Leave original error so the user can see the detail
      const message = e instanceof Error ? e.message : String(e);
      throw new OperationError("Unable to parse JavaScript.<br>" + message);
    }
    return result;
  }
}

export default JavaScriptBeautify;
