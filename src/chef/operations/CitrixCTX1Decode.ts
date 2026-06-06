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
import { OperationError } from "../errors/OperationError";

/**
 * Citrix CTX1 Decode operation
 *
 * @category Encodings
 * @see https://www.reddit.com/r/AskNetsec/comments/1s3r6y/citrix_ctx1_hash_decoding/
 */
export class CitrixCTX1Decode extends Operation {
    name = "Citrix CTX1 Decode";
    module = "Encodings";
    description = "Decodes strings in a Citrix CTX1 password format to plaintext.";
    infoURL = "https://www.reddit.com/r/AskNetsec/comments/1s3r6y/citrix_ctx1_hash_decoding/";
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
    run(input: ArrayBuffer, args: any[]): string {
        const inputBytes = new Uint8Array(input);
        if (inputBytes.length % 4 !== 0) {
            throw new OperationError("Incorrect hash length");
        }
        const revinput = new Uint8Array(inputBytes).reverse();
        const result: number[] = [];
        let temp = 0;
        for (let i = 0; i < revinput.length; i += 2) {
            if (i + 2 >= revinput.length) {
                temp = 0;
            } else {
                temp = ((revinput[i + 2] - 0x41) & 0xf) ^ (((revinput[i + 3] - 0x41) << 4) & 0xf0);
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
