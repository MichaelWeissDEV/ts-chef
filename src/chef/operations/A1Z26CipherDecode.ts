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
import { DELIM_OPTIONS } from "../lib/Delim";
import { OperationError } from "../errors/OperationError";

/**
 * A1Z26 Cipher Decode operation
 *
 * @category Ciphers
 */
export class A1Z26CipherDecode extends Operation {
    /**
     * A1Z26CipherDecode constructor
     */
    constructor() {
        super();
        this.name = "A1Z26 Cipher Decode";
        this.module = "Ciphers";
        this.description =
            "Converts alphabet order numbers into their corresponding alphabet character.\n\ne.g. 1 becomes a and 2 becomes b.";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Delimiter",
                type: "option",
                value: DELIM_OPTIONS,
            },
        ];
    }

    /**
     * Runs the operation.
     *
     * @param {string} input
     * @param {string[]} args
     * @returns {string}
     */
    run(input: string, args: string[]): string {
        const delim = Utils.charRep(args[0] || "Space");

        if (input.length === 0) {
            return "";
        }

        const bites = input.split(delim);
        let latin1 = "";
        for (let i = 0; i < bites.length; i++) {
            const n = parseInt(bites[i], 10);
            if (isNaN(n) || n < 1 || n > 26) {
                throw new OperationError("Error: all numbers must be between 1 and 26.");
            }
            latin1 += Utils.chr(n + 96);
        }
        return latin1;
    }
}

export default A1Z26CipherDecode;
