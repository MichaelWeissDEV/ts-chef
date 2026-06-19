/**
 * @fileoverview UnescapeString operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";

export class UnescapeString extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "Unescape string";
    this.module = "Default";
    this.description =
      "Unescapes a string (removes backslash-escape sequences). Supports \\n, \\t, \\r, \\', \\\", \\\\, \\0, \\x## and \\u####.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  run(input: string, _args: unknown[]): string {
    return input
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\r/g, "\r")
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\0/g, "\0")
      .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16)),
      )
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
        String.fromCodePoint(parseInt(hex, 16)),
      )
      .replace(/\\\\/g, "\\");
  }
}

export default UnescapeString;
