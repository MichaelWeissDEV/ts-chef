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

export class ZlibInflate extends Operation {
  constructor() {
    super();
    this.name = "Zlib inflate";
    this.module = "Compression";
    this.description =
      "Decompresses data compressed with the deflate algorithm (with zlib headers).";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [];
  }

  run(input: ArrayBuffer, _args: unknown[]): ArrayBuffer {
    try {
      const decompressed = pako.inflate(new Uint8Array(input));
      return decompressed.buffer as ArrayBuffer;
    } catch (err) {
      throw new OperationError("Inflate error: " + String(err));
    }
  }
}

export default ZlibInflate;
