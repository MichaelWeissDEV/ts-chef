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
import { encode } from "../lib/CipherSaber2";
import { Utils } from "../Utils";

/**
 * CipherSaber2 Decrypt operation
 *
 * @category Crypto
 * @see https://wikipedia.org/wiki/CipherSaber
 */
export class CipherSaber2Decrypt extends Operation {
    name = "CipherSaber2 Decrypt";
    module = "Crypto";
    description =
        "CipherSaber is a simple symmetric encryption protocol based on the RC4 stream cipher. It gives reasonably strong protection of message confidentiality, yet it's designed to be simple enough that even novice programmers can memorize the algorithm and implement it from scratch.";
    infoURL = "https://wikipedia.org/wiki/CipherSaber";
    inputType = "ArrayBuffer";
    outputType = "ArrayBuffer";
    args: ArgConfig[] = [
        {
            name: "Key",
            type: "toggleString",
            value: "",
            toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
        },
        {
            name: "Rounds",
            type: "number",
            value: 20,
        },
    ];

    /**
     * Runs the operation.
     *
     * @param {ArrayBuffer} input
     * @param {any[]} args
     * @returns {ArrayBuffer}
     */
    run(input: ArrayBuffer, args: any[]): ArrayBuffer {
        const inputBytes = new Uint8Array(input);
        const key = Utils.convertToByteArray(args[0].string, args[0].option);
        const rounds = args[1];

        const tempIVP = inputBytes.slice(0, 10);
        const ciphertext = inputBytes.slice(10);
        const result = encode(tempIVP, key, rounds, ciphertext);
        return new Uint8Array(result).buffer;
    }
}

export default CipherSaber2Decrypt;
