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
import { OperationError } from "../errors/OperationError";

export class JSONMinify extends Operation {
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
