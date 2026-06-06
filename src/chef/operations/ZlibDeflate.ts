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
import * as pako from "pako";

export class ZlibDeflate extends Operation {
  constructor() {
    super();
    this.name = "Zlib deflate";
    this.module = "Compression";
    this.description =
      "Compresses data using the deflate algorithm with zlib headers.";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [
      {
        name: "Compression level",
        type: "option",
        value: [
          "Default Compression",
          "Best Speed",
          "Best Compression",
          "No Compression",
        ],
      },
    ];
  }

  run(input: ArrayBuffer, args: unknown[]): ArrayBuffer {
    const levelOpt = args[0] as string;
    const levelMap: Record<string, number> = {
      "Default Compression": -1,
      "Best Speed": 1,
      "Best Compression": 9,
      "No Compression": 0,
    };
    const level = (levelMap[levelOpt] ?? -1) as
      | -1
      | 0
      | 1
      | 2
      | 3
      | 4
      | 5
      | 6
      | 7
      | 8
      | 9;
    try {
      const compressed = pako.deflate(new Uint8Array(input), { level });
      return compressed.buffer as ArrayBuffer;
    } catch (err) {
      throw new OperationError("Deflate error: " + String(err));
    }
  }
}

export default ZlibDeflate;
