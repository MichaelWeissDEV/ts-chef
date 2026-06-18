/**
 * @fileoverview UnescapeUnicodeCharacters operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation } from "../Operation";

export class UnescapeUnicodeCharacters extends Operation {
  constructor() {
    super();
    this.name = "Unescape Unicode Characters";
    this.module = "Default";
    this.description =
      "Unescapes Unicode escape sequences in strings. Supports \\uXXXX, \\u{XXXXXX}, %uXXXX formats.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Prefix", type: "option", value: ["\\u", "%u", "0x", "U+"] },
    ];
  }

  run(input: string, args: unknown[]): string {
    const prefix = (args[0] as string)
      .replace(/\\/g, "\\\\")
      .replace(/\//g, "\\/");
    const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re4 = new RegExp(escaped + "([0-9a-fA-F]{4})", "g");
    const re6 = new RegExp(
      escaped.replace("\\\\u", "\\\\u\\{") + "([0-9a-fA-F]{1,6})\\}",
      "g",
    );

    return input
      .replace(re6, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
      .replace(re4, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
  }
}

export default UnescapeUnicodeCharacters;
