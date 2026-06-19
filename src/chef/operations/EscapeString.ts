/**
 * @fileoverview EscapeString operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import jsesc from "jsesc";

/**
 * Escape string operation
 */
export class EscapeString extends TypedOperation<string, AnyInput, unknown[]> {
  /**
   * EscapeString constructor
   */
  constructor() {
    super();

    this.name = "Escape string";
    this.module = "Default";
    this.description =
      "Escapes special characters in a string so that they do not cause conflicts. For example, <code>Don't stop me now</code> becomes <code>Don\\'t stop me now</code>.<br><br>Supports the following escape sequences:<ul><li><code>\\n</code> (Line feed/newline)</li><li><code>\\r</code> (Carriage return)</li><li><code>\\t</code> (Horizontal tab)</li><li><code>\\b</code> (Backspace)</li><li><code>\\f</code> (Form feed)</li><li><code>\\xnn</code> (Hex, where n is 0-f)</li><li><code>\\\\</code> (Backslash)</li><li><code>\\'</code> (Single quote)</li><li><code>\\&quot;</code> (Double quote)</li><li><code>\\unnnn</code> (Unicode character)</li><li><code>\\u{nnnnnn}</code> (Unicode code point)</li></ul>";
    this.infoURL = "https://wikipedia.org/wiki/Escape_sequence";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Escape level",
        type: "option",
        value: ["Special chars", "Everything", "Minimal"],
      },
      {
        name: "Escape quote",
        type: "option",
        value: ["Single", "Double", "Backtick"],
      },
      {
        name: "JSON compatible",
        type: "boolean",
        value: false,
      },
      {
        name: "ES6 compatible",
        type: "boolean",
        value: true,
      },
      {
        name: "Uppercase hex",
        type: "boolean",
        value: false,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   *
   * @example
   * EscapeString.run("Don't do that", [])
   * > "Don\'t do that"
   * EscapeString.run(`Hello
   * World`, [])
   * > "Hello\nWorld"
   */
  run(input: string, args: unknown[]): AnyInput {
    const [level, quotes, jsonCompat, es6Compat, uppercaseHex] = args as [
      string,
      string,
      boolean,
      boolean,
      boolean,
    ];
    const lowercaseHex = !uppercaseHex;

    return jsesc(input, {
      quotes: quotes.toLowerCase() as "single" | "double" | "backtick",
      es6: es6Compat,
      escapeEverything: level === "Everything",
      json: jsonCompat,
      lowercaseHex: lowercaseHex,
    });
  }
}

export default EscapeString;
