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

export class ToSnakeCase extends Operation {
  constructor() {
    super();
    this.name = "To snake case";
    this.module = "Default";
    this.description = "Converts the input string to snake_case format.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Attempt to be intelligent", type: "boolean", value: false },
    ];
  }

  run(input: string, _args: unknown[]): string {
    return input
      .replace(/([A-Z])/g, "_$1")
      .replace(/[\s-]+/g, "_")
      .replace(/^_/, "")
      .replace(/_{2,}/g, "_")
      .toLowerCase();
  }
}

export default ToSnakeCase;
