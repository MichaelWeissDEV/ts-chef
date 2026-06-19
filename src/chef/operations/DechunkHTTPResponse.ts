/**
 * @fileoverview DechunkHTTPResponse operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";

/**
 * Dechunk HTTP response operation
 */
export class DechunkHTTPResponse extends TypedOperation<string, AnyInput, unknown[]> {
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
  run(input: string, _args: unknown[]): AnyInput {
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
