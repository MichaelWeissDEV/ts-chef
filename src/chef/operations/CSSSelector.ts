/**
 * @fileoverview CSSSelector operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import OperationError from "../errors/OperationError";
import { JSDOM } from "jsdom";

/**
 * CSS selector operation
 *
 * @category Code
 * @see https://wikipedia.org/wiki/Cascading_Style_Sheets#Selector
 */
export class CSSSelector extends TypedOperation<string, string, unknown[]> {
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
  run(input: string, args: unknown[]): string {
    const [query, delimiter] = args as [string, string];

    if (!query.length || !input.length) {
      return "";
    }

    const dom = new JSDOM(input);
    const document = dom.window.document;

    let result;
    try {
      result = document.querySelectorAll(query);
    } catch (err) {
      throw new OperationError(
        "Invalid CSS Selector. Details:\n" +
          (err instanceof Error ? err.message : String(err)),
      );
    }

    const nodeToString = function (node: {
      outerHTML?: string;
      toString(): string;
    }): string {
      return node.outerHTML || node.toString();
    };

    return Array.from(result).map(nodeToString).join(delimiter);
  }
}
