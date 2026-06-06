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
import { COMPRESSION_TYPE, ZLIB_COMPRESSION_TYPE_LOOKUP } from "../lib/Zlib";
import gzip from "zlibjs/bin/gzip.min.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Zlib = (gzip as any).Zlib;

/**
 * Gzip operation
 */
export class Gzip extends Operation {
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
  run(input: any, args: any[]): any {
    const filename = args[1],
      comment = args[2],
      options: {
        deflateOptions: { compressionType: number };
        flags: { fhcrc: boolean; fname?: boolean; comment?: boolean };
        filename?: string;
        comment?: string;
      } = {
        deflateOptions: {
          compressionType: ZLIB_COMPRESSION_TYPE_LOOKUP[args[0] as string],
        },
        flags: {
          fhcrc: args[3] as boolean,
        },
      };

    if ((filename as string).length) {
      options.flags.fname = true;
      options.filename = filename as string;
    }
    if ((comment as string).length) {
      options.flags.comment = true;
      options.comment = comment as string;
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
