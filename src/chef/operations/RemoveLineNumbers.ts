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

export class RemoveLineNumbers extends Operation {
  constructor() {
    super();
    this.name = "Remove line numbers";
    this.module = "Default";
    this.description =
      "Removes line numbers from the output if they can be trivially detected.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  run(input: string, _args: unknown[]): string {
    return input.replace(/^[ \t]{0,5}\d+[\s:|\-,.)\]]/gm, "");
  }
}

export default RemoveLineNumbers;
