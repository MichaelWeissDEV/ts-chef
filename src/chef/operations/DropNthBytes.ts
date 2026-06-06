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
import { OperationError } from "../errors/OperationError";

export class DropNthBytes extends Operation {
  constructor() {
    super();
    this.name = "Drop nth bytes";
    this.module = "Default";
    this.description = "Drops every nth byte starting with a given byte.";
    this.inputType = "byteArray";
    this.outputType = "byteArray";
    this.args = [
      { name: "Drop every", type: "number", value: 4 },
      { name: "Starting at", type: "number", value: 0 },
      { name: "Apply to each line", type: "boolean", value: false },
    ];
  }

  run(input: number[], args: unknown[]): number[] {
    const n = args[0] as number;
    const start = args[1] as number;
    const eachLine = args[2] as boolean;

    if (Math.floor(n) !== n || n <= 0) {
      throw new OperationError("'Drop every' must be a positive integer.");
    }
    if (Math.floor(start) !== start || start < 0) {
      throw new OperationError(
        "'Starting at' must be a positive or zero integer.",
      );
    }

    let offset = 0;
    const output: number[] = [];

    for (let i = 0; i < input.length; i++) {
      if (eachLine && input[i] === 0x0a) {
        output.push(0x0a);
        offset = i + 1;
      } else if (i - offset < start || (i - (start + offset)) % n !== 0) {
        output.push(input[i]);
      }
    }

    return output;
  }
}

export default DropNthBytes;
