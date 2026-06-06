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
import { COMPRESSION_TYPE } from "../lib/Zlib";
import rawdeflate from "zlibjs/bin/rawdeflate.min.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Zlib = (rawdeflate as any).Zlib;

const RAW_COMPRESSION_TYPE_LOOKUP = {
  "Fixed Huffman Coding": Zlib.RawDeflate.CompressionType.FIXED,
  "Dynamic Huffman Coding": Zlib.RawDeflate.CompressionType.DYNAMIC,
  "None (Store)": Zlib.RawDeflate.CompressionType.NONE,
};

/**
 * Raw Deflate operation
 */
export class RawDeflate extends Operation {
  /**
   * RawDeflate constructor
   */
  constructor() {
    super();

    this.name = "Raw Deflate";
    this.module = "Compression";
    this.description =
      "Compresses data using the deflate algorithm with no headers.";
    this.infoURL = "https://wikipedia.org/wiki/DEFLATE";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [
      {
        name: "Compression type",
        type: "option",
        value: COMPRESSION_TYPE,
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {ArrayBuffer}
   */
  run(input: any, args: any[]): any {
    const deflate = new Zlib.RawDeflate(new Uint8Array(input), {
      compressionType:
        RAW_COMPRESSION_TYPE_LOOKUP[
          args[0] as keyof typeof RAW_COMPRESSION_TYPE_LOOKUP
        ],
    });
    return new Uint8Array(deflate.compress()).buffer;
  }
}

export default RawDeflate;
