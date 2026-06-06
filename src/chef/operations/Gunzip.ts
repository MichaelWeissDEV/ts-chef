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
import gunzip from "zlibjs/bin/gunzip.min.js";

const Zlib = gunzip.Zlib;

/**
 * Gunzip operation
 */
export class Gunzip extends Operation {
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
  run(input: any, args: any[]): any {
    const gzipObj = new Zlib.Gunzip(new Uint8Array(input));
    return new Uint8Array(gzipObj.decompress()).buffer;
  }
}

export default Gunzip;
