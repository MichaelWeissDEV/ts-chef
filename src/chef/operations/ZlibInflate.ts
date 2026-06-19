/**
 * @fileoverview ZlibInflate operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";
import { OperationError } from "../errors/OperationError";
import * as pako from "pako";

export class ZlibInflate extends TypedOperation<ArrayBuffer, ArrayBuffer, unknown[]> {
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
