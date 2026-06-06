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
 * Caesar Box Cipher operation
 *
 * @category Ciphers
 */
export class CaesarBoxCipher extends Operation {
    /**
     * CaesarBoxCipher constructor
     */
    constructor() {
        super();
        this.name = "Caesar Box Cipher";
        this.module = "Ciphers";
        this.description =
            "Caesar Box is a transposition cipher used in the Roman Empire, in which letters of the message are written in rows in a square (or a rectangle) and then, read by column.";
        this.infoURL = "https://www.dcode.fr/caesar-box-cipher";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Box Height",
                type: "number",
                value: 1,
            },
        ];
    }

    /**
     * @param {string} input - The message to encode.
     * @param {number[]} args - Operation arguments.
     * @param {number} args[0] - Box height.
     * @returns {string} - The transposed message.
     */
    run(input: string, args: number[]): string {
        const tableHeight = args[0];
        const tableWidth = Math.ceil(input.length / tableHeight);
        input = input.replace(/ /g, "");
        const padNeeded = tableHeight * tableWidth - input.length;
        for (let i = 0; i < padNeeded; i++) {
            input += "\x00";
        }
        let result = "";
        for (let i = 0; i < tableHeight; i++) {
            for (let j = i; j < input.length; j += tableHeight) {
                if (input.charAt(j) !== "\x00") {
                    result += input.charAt(j);
                }
            }
        }
        return result;
    }
}

export default CaesarBoxCipher;
