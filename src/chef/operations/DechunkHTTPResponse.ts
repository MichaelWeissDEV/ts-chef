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

/**
 * Dechunk HTTP response operation
 */
export class DechunkHTTPResponse extends Operation {
  /**
   * DechunkHTTPResponse constructor
   */
  constructor() {
    super();

    this.name = "Dechunk HTTP response";
    this.module = "Default";
    this.description =
      "Parses an HTTP response transferred using Transfer-Encoding: Chunked";
    this.infoURL = "https://wikipedia.org/wiki/Chunked_transfer_encoding";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
    this.checks = [
      {
        pattern: "^[0-9A-F]+\r\n",
        flags: "i",
        args: [],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const chunks = [];
    let chunkSizeEnd = input.indexOf("\n") + 1;
    const lineEndings = input.charAt(chunkSizeEnd - 2) === "\r" ? "\r\n" : "\n";
    const lineEndingsLength = lineEndings.length;
    let chunkSize = parseInt(input.slice(0, chunkSizeEnd), 16);
    while (!isNaN(chunkSize)) {
      chunks.push(input.slice(chunkSizeEnd, chunkSize + chunkSizeEnd));
      input = input.slice(chunkSizeEnd + chunkSize + lineEndingsLength);
      chunkSizeEnd = input.indexOf(lineEndings) + lineEndingsLength;
      chunkSize = parseInt(input.slice(0, chunkSizeEnd), 16);
    }
    return chunks.join("") + input;
  }
}

export default DechunkHTTPResponse;
