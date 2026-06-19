/**
 * @fileoverview Gunzip operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";
import gunzip from "zlibjs/bin/gunzip.min.js";

const Zlib = gunzip.Zlib;

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
      "Decompresses data which has been compressed using the deflate algorithm with gzip headers.";
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
    const gzipObj = new Zlib.Gunzip(new Uint8Array(input));
    return new Uint8Array(gzipObj.decompress()).buffer;
  }
}

export default Gunzip;
