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

export class Label extends Operation {
  constructor() {
    super();
    this.name = "Label";
    this.module = "Default";
    this.description =
      "Provides a location for conditional and fixed jumps to redirect execution to.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Name",
        type: "shortString",
        value: "",
      },
    ];
  }

  run(input: string, _args: unknown[]): string {
    return input;
  }
}

export default Label;
