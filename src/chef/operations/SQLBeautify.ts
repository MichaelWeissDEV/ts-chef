/**
 * @fileoverview SQLBeautify operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { format } from "sql-formatter";
import { TypedOperation } from "../Operation";

export class SQLBeautify extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "SQL Beautify";
    this.module = "Code";
    this.description =
      "Indents and prettifies Structured Query Language (SQL) code.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Indent string", type: "binaryShortString", value: "\\t" },
    ];
  }

  run(input: string, args: unknown[]): string {
    const indentStr = args[0] as string;
    const bindRegex = /:\w+/g;
    const bindMap: Record<string, string> = {};
    let bindCounter = 0;
    const placeholderInput = input.replace(bindRegex, (match: string) => {
      const placeholder = `__BIND_${bindCounter++}__`;
      bindMap[placeholder] = match;
      return placeholder;
    });
    let formatted = format(placeholderInput, {
      language: "sql",
      tabWidth: indentStr === "\t" ? 4 : indentStr.length || 4,
      useTabs: indentStr === "\t",
    });
    formatted = formatted.replace(
      /__BIND_\d+__/g,
      (match: string) => bindMap[match] || match,
    );
    return formatted;
  }
}

export default SQLBeautify;
