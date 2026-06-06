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

export class PadLines extends Operation {
  constructor() {
    super();
    this.name = "Pad lines";
    this.module = "Default";
    this.description =
      "Add the specified number of the specified character to the beginning or end of each line";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Position", type: "option", value: ["Start", "End"] },
      { name: "Length", type: "number", value: 5 },
      { name: "Character", type: "binaryShortString", value: " " },
    ];
  }

  run(input: string, args: unknown[]): string {
    const [position, len, chr] = args as [string, number, string];
    const lines = input.split("\n");
    const result: string[] = [];

    for (const line of lines) {
      if (position === "Start") {
        result.push(line.padStart(line.length + len, chr));
      } else {
        result.push(line.padEnd(line.length + len, chr));
      }
    }

    return result.join("\n");
  }
}

export default PadLines;
