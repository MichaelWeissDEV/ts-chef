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

export class ToKebabCase extends Operation {
  constructor() {
    super();
    this.name = "To kebab case";
    this.module = "Default";
    this.description = "Converts the input string to kebab-case format.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Attempt to be intelligent", type: "boolean", value: false },
    ];
  }

  run(input: string, _args: unknown[]): string {
    return input
      .replace(/([A-Z])/g, "-$1")
      .replace(/[\s_]+/g, "-")
      .replace(/^-/, "")
      .replace(/-{2,}/g, "-")
      .toLowerCase();
  }
}

export default ToKebabCase;
