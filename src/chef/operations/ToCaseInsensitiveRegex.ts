/**
 * @fileoverview ToCaseInsensitiveRegex operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";

export class ToCaseInsensitiveRegex extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "To case insensitive regex";
    this.module = "Default";
    this.description =
      "Converts a string to a case-insensitive regex by replacing each letter with [Aa] notation.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  run(input: string, _args: unknown[]): string {
    return Array.from(input)
      .map((ch) => {
        const lower = ch.toLowerCase();
        const upper = ch.toUpperCase();
        if (lower !== upper) {
          return `[${lower}${upper}]`;
        }
        return ch;
      })
      .join("");
  }
}

export default ToCaseInsensitiveRegex;
