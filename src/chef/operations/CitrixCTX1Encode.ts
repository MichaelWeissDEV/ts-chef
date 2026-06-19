/**
 * @fileoverview CitrixCTX1Encode operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, ArgConfig } from "../Operation";

/**
 * Citrix CTX1 Encode operation
 *
 * @category Encodings
 * @see https://www.reddit.com/r/AskNetsec/comments/1s3r6y/citrix_ctx1_hash_decoding/
 */
export class CitrixCTX1Encode extends TypedOperation<string, number[], unknown[]> {
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
  run(input: string, _args: unknown[]): number[] {
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
