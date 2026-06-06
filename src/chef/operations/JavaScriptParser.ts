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
import * as esprima from "esprima";

/**
 * JavaScript Parser operation
 */
export class JavaScriptParser extends Operation {
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
  run(input: any, args: any[]): any {
    const [parseLoc, parseRange, parseTokens, parseComment, parseTolerant] =
        args,
      options = {
        loc: parseLoc,
        range: parseRange,
        tokens: parseTokens,
        comment: parseComment,
        tolerant: parseTolerant,
      };
    let result = {};

    result = esprima.parseScript(input, options);
    return JSON.stringify(result, null, 2);
  }
}

export default JavaScriptParser;
