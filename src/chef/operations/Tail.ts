/**
 * @fileoverview Tail operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
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
