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

export class ToCaseInsensitiveRegex extends Operation {
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
