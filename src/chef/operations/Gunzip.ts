/**
 * @fileoverview Gunzip operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";
import OperationError from "../errors/OperationError";
import { gunzipSync } from "zlib";

export const MAX_GUNZIP_OUTPUT_BYTES = 64 * 1024 * 1024;

/** Node's zlib aborts before allocating output beyond maxOutputLength. */
export function gunzipWithLimit(
  input: ArrayBuffer,
  maxOutputLength = MAX_GUNZIP_OUTPUT_BYTES,
): ArrayBuffer {
  const source = new Uint8Array(input);
  if (source.byteLength > MAX_GUNZIP_OUTPUT_BYTES) {
    throw new OperationError("Gunzip input exceeds the 64 MiB safety limit");
  }
  try {
    const output = gunzipSync(source, { maxOutputLength });
    return output.buffer.slice(
      output.byteOffset,
      output.byteOffset + output.byteLength,
    ) as ArrayBuffer;
  } catch (error) {
    const limitLabel =
      maxOutputLength >= 1024 * 1024
        ? `${Math.floor(maxOutputLength / 1024 / 1024)} MiB`
        : `${Math.floor(maxOutputLength / 1024)} KiB`;
    throw new OperationError(
      `Gunzip failed or exceeded the ${limitLabel} output limit: ${String(error)}`,
    );
  }
}

/**
 * Gunzip operation
 */
export class Gunzip extends TypedOperation<ArrayBuffer, AnyInput, unknown[]> {
  /**
   * Gunzip constructor
   */
  constructor() {
    super();

    this.name = "Gunzip";
    this.module = "Compression";
    this.description =
      "Decompresses data which has been compressed using the deflate algorithm with gzip headers. Input and output are capped at 64 MiB for safe analysis of untrusted data.";
    this.infoURL = "https://wikipedia.org/wiki/Gzip";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [];
    this.checks = [
      {
        pattern: "^\\x1f\\x8b\\x08",
        flags: "",
        args: [],
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {File}
   */
  run(input: ArrayBuffer, _args: unknown[]): AnyInput {
    return gunzipWithLimit(input);
  }
}

export default Gunzip;
