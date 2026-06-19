/**
 * @fileoverview CitrixCTX1Decode operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, ArgConfig } from "../Operation";
import { OperationError } from "../errors/OperationError";

/**
 * Citrix CTX1 Decode operation
 *
 * @category Encodings
 * @see https://www.reddit.com/r/AskNetsec/comments/1s3r6y/citrix_ctx1_hash_decoding/
 */
export class CitrixCTX1Decode extends TypedOperation<ArrayBuffer, string, unknown[]> {
  name = "Citrix CTX1 Decode";
  module = "Encodings";
  description =
    "Decodes strings in a Citrix CTX1 password format to plaintext.";
  infoURL =
    "https://www.reddit.com/r/AskNetsec/comments/1s3r6y/citrix_ctx1_hash_decoding/";
  inputType = "ArrayBuffer";
  outputType = "string";
  args: ArgConfig[] = [];

  /**
   * Runs the operation.
   *
   * @param {ArrayBuffer} input
   * @param {any[]} args
   * @returns {string}
   */
  run(input: ArrayBuffer, _args: unknown[]): string {
    const inputBytes = new Uint8Array(input);
    if (inputBytes.length % 4 !== 0) {
      throw new OperationError("Incorrect hash length");
    }
    const revinput = new Uint8Array(inputBytes).reverse();
    const result: number[] = [];
    let temp: number;
    for (let i = 0; i < revinput.length; i += 2) {
      if (i + 2 >= revinput.length) {
        temp = 0;
      } else {
        temp =
          ((revinput[i + 2] - 0x41) & 0xf) ^
          (((revinput[i + 3] - 0x41) << 4) & 0xf0);
      }
      temp =
        ((revinput[i] - 0x41) & 0xf) ^
        (((revinput[i + 1] - 0x41) << 4) & 0xf0) ^
        0xa5 ^
        temp;
      result.push(temp);
    }
    // Decodes a utf-16le string
    return Buffer.from(result.reverse()).toString("utf16le");
  }
}

export default CitrixCTX1Decode;
