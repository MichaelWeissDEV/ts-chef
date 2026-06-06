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

export class Merge extends Operation {
  constructor() {
    super();
    this.name = "Merge";
    this.module = "Default";
    this.description =
      "Consolidate all branches back into a single trunk. The opposite of Fork.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Merge All",
        type: "boolean",
        value: true,
      },
    ];
  }

  run(input: string, _args: unknown[]): string {
    return input;
  }
}

export default Merge;
