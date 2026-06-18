/**
 * @fileoverview Zlib module for ts-chef extension
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import zlibAndGzip from "zlibjs/bin/zlib_and_gzip.min.js";

const Zlib = zlibAndGzip.Zlib;

export const COMPRESSION_TYPE = [
  "Dynamic Huffman Coding",
  "Fixed Huffman Coding",
  "None (Store)",
];
export const INFLATE_BUFFER_TYPE = ["Adaptive", "Block"];

export const ZLIB_COMPRESSION_TYPE_LOOKUP: Record<string, any> = {
  "Fixed Huffman Coding": Zlib.Deflate.CompressionType.FIXED,
  "Dynamic Huffman Coding": Zlib.Deflate.CompressionType.DYNAMIC,
  "None (Store)": Zlib.Deflate.CompressionType.NONE,
};

export default Zlib;
