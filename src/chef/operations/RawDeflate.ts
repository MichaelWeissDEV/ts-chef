/**
 * @fileoverview RawDeflate operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, AnyInput } from "../Operation";
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
  run(input: ArrayBuffer, args: unknown[]): ArrayBuffer {
    const [compressionType] = args as [
      keyof typeof RAW_COMPRESSION_TYPE_LOOKUP,
    ];
    const deflate = new Zlib.RawDeflate(new Uint8Array(input), {
      compressionType: RAW_COMPRESSION_TYPE_LOOKUP[compressionType],
    });
    return new Uint8Array(deflate.compress()).buffer;
  }
}

export default RawDeflate;
