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

import { Operation, ArgConfig } from "../Operation";

/**
 * Citrix CTX1 Encode operation
 *
 * @category Encodings
 * @see https://www.reddit.com/r/AskNetsec/comments/1s3r6y/citrix_ctx1_hash_decoding/
 */
export class CitrixCTX1Encode extends Operation {
  name = "Citrix CTX1 Encode";
  module = "Encodings";
  description = "Encodes strings to Citrix CTX1 password format.";
  infoURL =
    "https://www.reddit.com/r/AskNetsec/comments/1s3r6y/citrix_ctx1_hash_decoding/";
  inputType = "string";
  outputType = "byteArray";
  args: ArgConfig[] = [];

  /**
   * Runs the operation.
   *
   * @param {string} input
   * @param {any[]} args
   * @returns {number[]}
   */
  run(input: string, args: any[]): number[] {
    const utf16pass = Buffer.from(input, "utf16le");
    const result: number[] = [];
    let temp = 0;
    for (let i = 0; i < utf16pass.length; i++) {
      temp = utf16pass[i] ^ 0xa5 ^ temp;
      result.push(((temp >>> 4) & 0xf) + 0x41);
      result.push((temp & 0xf) + 0x41);
    }

    return result;
  }
}

export default CitrixCTX1Encode;
