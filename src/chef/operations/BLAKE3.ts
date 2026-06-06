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
import { Utils } from "../Utils";
import { OperationError } from "../errors/OperationError";
import { blake3 } from "hash-wasm";

/**
 * BLAKE3 operation
 * 
 * @category Hashing
 * @see https://en.wikipedia.org/wiki/BLAKE_(hash_function)#BLAKE3
 */
export class BLAKE3 extends Operation {
    constructor() {
        super();
        this.name = "BLAKE3";
        this.module = "Hashing";
        this.description =
            "Hashes the input using BLAKE3 (UTF-8 encoded), with an optional key (also UTF-8), and outputs the result in hexadecimal format.";
        this.infoURL = "https://en.wikipedia.org/wiki/BLAKE_(hash_function)#BLAKE3";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Size (bytes)",
                type: "number",
                value: 32,
            },
            {
                name: "Key",
                type: "string",
                value: "",
            },
        ];
    }

    /**
     * Runs the operation.
     * 
     * @param {string} input
     * @param {unknown[]} args
     * @returns {Promise<string>}
     */
    run(input: string, args: unknown[]): Promise<string> {
        const size = args[0] as number;
        const key = args[1] as string;
        const inputBytes = new Uint8Array(Utils.strToArrayBuffer(input));

        if (key !== "") {
            const keyBytes = new Uint8Array(Utils.strToArrayBuffer(key));
            if (keyBytes.length !== 32) {
                throw new OperationError("The key must be exactly 32 bytes long");
            }
            return blake3(inputBytes, size * 8, keyBytes);
        }
        return blake3(inputBytes, size * 8);
    }
}

export default BLAKE3;
