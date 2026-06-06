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

export class Subsection extends Operation {
  constructor() {
    super();
    this.name = "Subsection";
    this.flowControl = true;
    this.module = "Default";
    this.description =
      "Select a part of the input data using a regular expression, and run all subsequent operations on each match separately.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Section (regex)", type: "string", value: "" },
      { name: "Case sensitive matching", type: "boolean", value: true },
      { name: "Global matching", type: "boolean", value: true },
      { name: "Ignore errors", type: "boolean", value: false },
    ];
  }

  run(input: string, _args: unknown[]): string {
    return input;
  }
}

export default Subsection;
