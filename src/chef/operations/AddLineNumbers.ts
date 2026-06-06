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
 * Add line numbers operation
 *
 * @category Utils
 */
export class AddLineNumbers extends Operation {
    /**
     * AddLineNumbers constructor
     */
    constructor() {
        super();
        this.name = "Add line numbers";
        this.module = "Default";
        this.description = "Adds line numbers to the output.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Offset",
                type: "number",
                value: 0,
            },
        ];
    }

    /**
     * Runs the operation.
     *
     * @param {string} input - The input string.
     * @param {number[]} args - Operation arguments.
     * @param {number} args[0] - The starting line number offset.
     * @returns {string} - The input string with line numbers added.
     *
     * @see {@link RemoveLineNumbers}
     */
    run(input: string, args: number[]): string {
        const lines = input.split("\n");
        const width = lines.length.toString().length;
        const offset = args[0] ? parseInt(String(args[0]), 10) : 0;
        const output: string[] = [];

        for (let n = 0; n < lines.length; n++) {
            output.push((n + 1 + offset).toString().padStart(width, " ") + " " + lines[n]);
        }
        return output.join("\n");
    }
}

export default AddLineNumbers;
