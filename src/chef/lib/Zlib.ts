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

// @ts-ignore
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
