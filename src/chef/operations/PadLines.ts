/**
 * @fileoverview PadLines operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";

export class PadLines extends TypedOperation<string, string, unknown[]> {
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
