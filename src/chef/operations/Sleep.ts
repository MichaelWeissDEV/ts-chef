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

export class Sleep extends Operation {
  constructor() {
    super();
    this.name = "Sleep";
    this.module = "Default";
    this.description =
      "Sleep causes the recipe to wait for a specified number of milliseconds before continuing execution.";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [{ name: "Time (ms)", type: "number", value: 1000 }];
  }

  async run(input: ArrayBuffer, args: unknown[]): Promise<ArrayBuffer> {
    const ms = args[0] as number;
    await new Promise((r) => setTimeout(r, ms));
    return input;
  }
}

export default Sleep;
