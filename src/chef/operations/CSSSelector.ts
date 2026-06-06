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

import Operation from "../Operation";
import OperationError from "../errors/OperationError";

/**
 * CSS selector operation
 *
 * @category Code
 * @see https://wikipedia.org/wiki/Cascading_Style_Sheets#Selector
 */
export class CSSSelector extends Operation {
  /**
   * CSSSelector constructor
   */
  constructor() {
    super();

    this.name = "CSS selector";
    this.module = "Code";
    this.description =
      "Extract information from an HTML document with a CSS selector";
    this.infoURL = "https://wikipedia.org/wiki/Cascading_Style_Sheets#Selector";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "CSS selector",
        type: "string",
        value: "",
      },
      {
        name: "Delimiter",
        type: "binaryShortString",
        value: "\\n",
      },
    ];
  }

  /**
   * Runs the CSS selector operation.
   *
   * @param {string} input
   * @param {any[]} args
   * @returns {string}
   */
  run(input: string, args: any[]): string {
    const [query, delimiter] = args;

    if (!query.length || !input.length) {
      return "";
    }

    const { JSDOM } = require("jsdom");
    const dom = new JSDOM(input);
    const document = dom.window.document;

    let result;
    try {
      result = document.querySelectorAll(query);
    } catch (err: any) {
      throw new OperationError(
        "Invalid CSS Selector. Details:\n" + err.message,
      );
    }

    const nodeToString = function (node: any): string {
      return node.outerHTML || node.toString();
    };

    return Array.from(result).map(nodeToString).join(delimiter);
  }
}
