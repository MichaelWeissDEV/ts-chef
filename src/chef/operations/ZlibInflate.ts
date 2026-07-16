/**
 * @fileoverview ZlibInflate operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import { OperationError } from "../errors/OperationError";
import { inflateSync } from "zlib";

export const MAX_ZLIB_INFLATE_OUTPUT_BYTES = 64 * 1024 * 1024;

export function zlibInflateWithLimit(
  input: ArrayBuffer,
  maxOutputLength = MAX_ZLIB_INFLATE_OUTPUT_BYTES,
): ArrayBuffer {
  const source = new Uint8Array(input);
  if (source.byteLength > MAX_ZLIB_INFLATE_OUTPUT_BYTES) {
    throw new OperationError("Zlib input exceeds the 64 MiB safety limit");
  }
  try {
    const output = inflateSync(source, { maxOutputLength });
    return output.buffer.slice(
      output.byteOffset,
      output.byteOffset + output.byteLength,
    ) as ArrayBuffer;
  } catch (error) {
    throw new OperationError(
      `Inflate failed or exceeded the configured output limit: ${String(error)}`,
    );
  }
}

export class ZlibInflate extends TypedOperation<ArrayBuffer, ArrayBuffer, unknown[]> {
  constructor() {
    super();
    this.name = "Zlib inflate";
    this.module = "Compression";
    this.description =
      "Decompresses data compressed with the deflate algorithm (with zlib headers). Input and output are capped at 64 MiB for safe analysis of untrusted data.";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [];
  }

  run(input: ArrayBuffer, _args: unknown[]): ArrayBuffer {
    return zlibInflateWithLimit(input);
  }
}

export default ZlibInflate;
