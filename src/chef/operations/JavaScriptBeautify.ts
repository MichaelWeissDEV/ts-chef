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

import { Operation } from "../Operation";
import OperationError from "../errors/OperationError";
import escodegen from "escodegen";
import * as esprima from "esprima";

/**
 * JavaScript Beautify operation
 */
export class JavaScriptBeautify extends Operation {
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
  run(input: any, args: any[]): any {
    const beautifyIndent = args[0] || "\\t",
      quotes = args[1].toLowerCase(),
      [, beautifySemicolons, beautifyComment] = args;
    let result = "",
      AST;

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

      result = escodegen.generate(AST, options);
    } catch (e: any) {
      // Leave original error so the user can see the detail
      throw new OperationError("Unable to parse JavaScript.<br>" + e.message);
    }
    return result;
  }
}

export default JavaScriptBeautify;
