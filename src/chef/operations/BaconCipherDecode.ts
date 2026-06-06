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
import {
    BACON_ALPHABETS,
    BACON_TRANSLATION_CASE,
    BACON_TRANSLATION_AMNZ,
    BACON_TRANSLATIONS,
    BACON_CLEARER_MAP,
    BACON_NORMALIZE_MAP,
    swapZeroAndOne } from "../lib/Bacon";

/**
 * Bacon Cipher Decode operation
 *
 * @category Ciphers
 * @see {@link BaconCipherEncode}
 */
export class BaconCipherDecode extends Operation {
    constructor() {
        super();
        this.name = "Bacon Cipher Decode";
        this.module = "Default";
        this.description =
            "Bacon's cipher or the Baconian cipher is a method of steganography devised by Francis Bacon in 1605. A message is concealed in the presentation of text, rather than its content.";
        this.infoURL = "https://wikipedia.org/wiki/Bacon%27s_cipher";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Alphabet",
                type: "option",
                value: Object.keys(BACON_ALPHABETS),
            },
            {
                name: "Translation",
                type: "option",
                value: BACON_TRANSLATIONS,
            },
            {
                name: "Invert Translation",
                type: "boolean",
                value: false,
            },
        ];
    }

    /**
     * Runs the Bacon Cipher Decode operation.
     *
     * @param {string} input - The encoded message.
     * @param {unknown[]} args - The operation arguments.
     * @param {string} args[0] - The alphabet to use (e.g., "Standard", "Complete").
     * @param {string} args[1] - The translation method (e.g., "0/1", "A/B", "Case").
     * @param {boolean} args[2] - Whether to invert the translation.
     * @returns {string} The decoded message.
     */
    run(input: string, args: unknown[]): string {
        const [alphabet, translation, invert] = args as [string, string, boolean];
        const alphabetObject = BACON_ALPHABETS[alphabet];

        input = input.replace(BACON_CLEARER_MAP[translation] ?? /[^01]/g, "");

        if (BACON_NORMALIZE_MAP[translation] !== undefined) {
            const normalizeMap = BACON_NORMALIZE_MAP[translation];
            input = input.replace(/./g, (c) => normalizeMap[c] ?? c);
        } else if (translation === BACON_TRANSLATION_CASE) {
            const codeA = "A".charCodeAt(0);
            const codeZ = "Z".charCodeAt(0);
            input = input.replace(/./g, (c) => {
                const code = c.charCodeAt(0);
                return code >= codeA && code <= codeZ ? "1" : "0";
            });
        } else if (translation === BACON_TRANSLATION_AMNZ) {
            const words = input.split(/\s+/);
            const letters = words.map((e) => {
                if (e) {
                    const code = e[0].toUpperCase().charCodeAt(0);
                    return code >= "N".charCodeAt(0) ? "1" : "0";
                }
                return "";
            });
            input = letters.join("");
        }

        if (invert) {
            input = swapZeroAndOne(input);
        }

        const inputArray = input.match(/(.{5})/g) || [];
        let output = "";

        for (let i = 0; i < inputArray.length; i++) {
            const code = inputArray[i];
            const number = parseInt(code, 2);
            output +=
                number < alphabetObject.alphabet.length ? alphabetObject.alphabet[number] : "?";
        }
        return output;
    }
}

export default BaconCipherDecode;
