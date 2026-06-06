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

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import bcrypt from "bcryptjs";

/**
 * Bcrypt parse operation
 *
 * @category Crypto
 * @see {@link Bcrypt}
 * @see {@link BcryptCompare}
 */
export class BcryptParse extends Operation {
    /**
     * BcryptParse constructor
     */
    constructor() {
        super();

        this.name = "Bcrypt parse";
        this.module = "Crypto";
        this.description =
            "Parses a bcrypt hash to determine the number of rounds used, the salt, and the password hash.";
        this.infoURL = "https://wikipedia.org/wiki/Bcrypt";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * Runs the Bcrypt parse operation.
     *
     * @param {string} input - The bcrypt hash to parse.
     * @param {any[]} _args - The operation arguments (none).
     * @returns {Promise<string>} A string containing the parsed information (rounds, salt, password hash).
     */
    async run(input: string, _args: any[]): Promise<string> {
        try {
            const rounds = bcrypt.getRounds(input);
            const salt = bcrypt.getSalt(input);
            const hash = input.split(salt)[1];

            return `Rounds: ${rounds}
Salt: ${salt}
Password hash: ${hash}
Full hash: ${input}`;
        } catch (err: any) {
            throw new OperationError("Error: " + err.toString());
        }
    }
}

export default BcryptParse;
