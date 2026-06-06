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

export class GetAllCasings extends Operation {
  constructor() {
    super();
    this.name = "Get All Casings";
    this.module = "Default";
    this.description = "Outputs all possible casing variations of a string.";
    this.infoURL = "";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  run(input: string, _args: unknown[]): string {
    const length = input.length;
    const max = 1 << length;
    const lower = input.toLowerCase();
    const lines: string[] = [];

    for (let i = 0; i < max; i++) {
      const chars = lower.split("");
      for (let j = 0; j < length; j++) {
        if (((i >> j) & 1) === 1) {
          chars[j] = chars[j].toUpperCase();
        }
      }
      lines.push(chars.join(""));
    }
    return lines.join("\n");
  }
}

export default GetAllCasings;
