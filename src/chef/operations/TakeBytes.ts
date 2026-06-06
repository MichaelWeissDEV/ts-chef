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

export class TakeBytes extends Operation {
  constructor() {
    super();
    this.name = "Take bytes";
    this.module = "Default";
    this.description =
      "Takes a slice of the input data from the specified start position to end position.";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [
      { name: "Start", type: "number", value: 0 },
      { name: "Length", type: "number", value: 5 },
      { name: "Apply to each line", type: "boolean", value: false },
    ];
  }

  run(input: ArrayBuffer, args: unknown[]): ArrayBuffer {
    const start = args[0] as number;
    const length = args[1] as number;
    const applyToEachLine = args[2] as boolean;

    if (!applyToEachLine) {
      return input.slice(start, start + length);
    }

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const text = decoder.decode(input);
    const lines = text.split("\n");
    const result = lines
      .map((line) => line.slice(start, start + length))
      .join("\n");
    return encoder.encode(result).buffer as ArrayBuffer;
  }
}

export default TakeBytes;
