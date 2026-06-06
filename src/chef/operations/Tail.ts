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

export class Tail extends Operation {
  constructor() {
    super();
    this.name = "Tail";
    this.module = "Default";
    this.description =
      "Like the UNIX tail command, returns the last N lines or bytes from the input.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Unit", type: "option", value: ["Line", "Byte"] },
      { name: "Number", type: "number", value: 10 },
    ];
  }

  run(input: string, args: unknown[]): string {
    const unit = args[0] as string;
    const n = args[1] as number;
    if (unit === "Line") {
      const lines = input.split("\n");
      return lines.slice(-n).join("\n");
    } else {
      return input.slice(-n);
    }
  }
}

export default Tail;
