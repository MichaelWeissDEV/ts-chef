/**
 * @fileoverview Gzip operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";
import { COMPRESSION_TYPE, ZLIB_COMPRESSION_TYPE_LOOKUP } from "../lib/Zlib";
import gzip from "zlibjs/bin/gzip.min.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Zlib = (gzip as any).Zlib;

/**
 * Gzip operation
 */
export class Gzip extends TypedOperation<ArrayBuffer, AnyInput, unknown[]> {
  /**
   * Gzip constructor
   */
  constructor() {
    super();

    this.name = "Gzip";
    this.module = "Compression";
    this.description =
      "Compresses data using the deflate algorithm with gzip headers.";
    this.infoURL = "https://wikipedia.org/wiki/Gzip";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [
      {
        name: "Compression type",
        type: "option",
        value: COMPRESSION_TYPE,
      },
      {
        name: "Filename (optional)",
        type: "string",
        value: "",
      },
      {
        name: "Comment (optional)",
        type: "string",
        value: "",
      },
      {
        name: "Include file checksum",
        type: "boolean",
        value: false,
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {ArrayBuffer}
   */
  run(input: ArrayBuffer, args: unknown[]): AnyInput {
    const [_compressionType, filename, comment, fhcrc] = args as [
      string,
      string,
      string,
      boolean,
    ];
    const options: {
      deflateOptions: { compressionType: number };
      flags: { fhcrc: boolean; fname?: boolean; comment?: boolean };
      filename?: string;
      comment?: string;
    } = {
      deflateOptions: {
        compressionType: ZLIB_COMPRESSION_TYPE_LOOKUP[_compressionType],
      },
      flags: {
        fhcrc: fhcrc,
      },
    };

    if (filename.length) {
      options.flags.fname = true;
      options.filename = filename;
    }
    if (comment.length) {
      options.flags.comment = true;
      options.comment = comment;
    }
    const gzipObj = new Zlib.Gzip(new Uint8Array(input), options);
    const compressed = new Uint8Array(gzipObj.compress());
    if (options.flags.comment && !(compressed[3] & 0x10)) {
      compressed[3] |= 0x10;
    }
    return compressed.buffer;
  }
}

export default Gzip;
