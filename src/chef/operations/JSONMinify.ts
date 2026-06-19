/**
 * @fileoverview JSONMinify operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";
import { OperationError } from "../errors/OperationError";

export class JSONMinify extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "JSON Minify";
    this.module = "Code";
    this.description = "Compresses JavaScript Object Notation (JSON) code.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  run(input: string, _args: unknown[]): string {
    if (!input) return "";
    try {
      return JSON.stringify(JSON.parse(input));
    } catch (err) {
      throw new OperationError("Unable to parse JSON: " + err);
    }
  }
}

export default JSONMinify;
