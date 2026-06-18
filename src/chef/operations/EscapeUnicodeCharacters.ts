/**
 * @fileoverview EscapeUnicodeCharacters operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, AnyInput } from "../Operation";

/**
 * Escape Unicode Characters operation
 */
export class EscapeUnicodeCharacters extends Operation {
  /**
   * EscapeUnicodeCharacters constructor
   */
  constructor() {
    super();

    this.name = "Escape Unicode Characters";
    this.module = "Default";
    this.description =
      "Converts characters to their unicode-escaped notations.<br><br>Supports the prefixes:<ul><li><code>\\u</code></li><li><code>%u</code></li><li><code>U+</code></li></ul>e.g. <code>σου</code> becomes <code>\\u03C3\\u03BF\\u03C5</code>";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Prefix",
        type: "option",
        value: ["\\u", "%u", "U+"],
      },
      {
        name: "Encode all chars",
        type: "boolean",
        value: false,
      },
      {
        name: "Padding",
        type: "number",
        value: 4,
      },
      {
        name: "Uppercase hex",
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
  run(input: string, args: unknown[]): AnyInput {
    const [prefix, encodeAll, padding, uppercaseHex] = args as [
      string,
      boolean,
      number,
      boolean,
    ];
    const regexWhitelist = /[ -~]/i;

    let output = "",
      character: string;

    for (let i = 0; i < input.length; i++) {
      character = input[i];
      if (!encodeAll && regexWhitelist.test(character)) {
        // It’s a printable ASCII character so don’t escape it.
        output += character;
        continue;
      }

      let cp = character.codePointAt(0)!.toString(16);
      if (uppercaseHex) cp = cp.toUpperCase();
      output += prefix + cp.padStart(padding, "0");
    }

    return output;
  }
}

export default EscapeUnicodeCharacters;
