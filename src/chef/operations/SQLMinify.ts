/**
 * @fileoverview SQLMinify operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";

export class SQLMinify extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "SQL Minify";
    this.module = "Code";
    this.description = "Compresses Structured Query Language (SQL) code.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  run(input: string, _args: unknown[]): string {
    return input
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/--[^\n]*/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
}

export default SQLMinify;
