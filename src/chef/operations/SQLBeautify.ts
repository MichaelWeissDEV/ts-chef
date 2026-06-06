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

import { format } from "sql-formatter";
import { Operation } from "../Operation";

export class SQLBeautify extends Operation {
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
