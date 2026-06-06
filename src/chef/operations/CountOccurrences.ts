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

interface ToggleStringArg {
    string: string;
    option: string;
}

/**
 * Count occurrences operation
 *
 * @category Default
 */
export class CountOccurrences extends Operation {
    /**
     * CountOccurrences constructor
     */
    constructor() {
        super();
        this.name = "Count occurrences";
        this.module = "Default";
        this.description =
            "Counts the number of times the provided string occurs in the input.";
        this.inputType = "string";
        this.outputType = "number";
        this.args = [
            {
                name: "Search string",
                type: "toggleString",
                value: "",
                toggleValues: ["Regex", "Extended (\\n, \\t, \\x...)", "Simple string"],
            },
        ];
    }

    /**
     * Runs the operation.
     *
     * @param {string} input
     * @param {ToggleStringArg[]} args
     * @returns {number}
     */
    run(input: string, args: ToggleStringArg[]): number {
        let search = args[0].string;
        const type = args[0].option;

        if (type === "Regex" && search) {
            try {
                const regex = new RegExp(search, "gi");
                const matches = input.match(regex);
                return matches ? matches.length : 0;
            } catch {
                return 0;
            }
        } else if (search) {
            if (type.indexOf("Extended") === 0) {
                search = Utils.parseEscapedChars(search);
            }
            let count = 0;
            let pos = 0;
            while ((pos = input.indexOf(search, pos)) !== -1) {
                count++;
                pos += search.length;
            }
            return count;
        } else {
            return 0;
        }
    }
}

export default CountOccurrences;
