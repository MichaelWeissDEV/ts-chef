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
  BACON_TRANSLATIONS_FOR_ENCODING,
  BACON_TRANSLATION_AB,
  swapZeroAndOne,
} from "../lib/Bacon";

/**
 * Bacon Cipher Encode operation
 *
 * @category Ciphers
 * @see {@link BaconCipherDecode}
 */
export class BaconCipherEncode extends Operation {
  constructor() {
    super();
    this.name = "Bacon Cipher Encode";
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
        value: BACON_TRANSLATIONS_FOR_ENCODING,
      },
      {
        name: "Keep extra characters",
        type: "boolean",
        value: false,
      },
      {
        name: "Invert Translation",
        type: "boolean",
        value: false,
      },
    ];
  }

  /**
   * Runs the Bacon Cipher Encode operation.
   *
   * @param {string} input - The message to encode.
   * @param {unknown[]} args - The operation arguments.
   * @param {string} args[0] - The alphabet to use (e.g., "Standard", "Complete").
   * @param {string} args[1] - The translation method (e.g., "0/1", "A/B").
   * @param {boolean} args[2] - Whether to keep extra characters (non-alphabetical).
   * @param {boolean} args[3] - Whether to invert the translation.
   * @returns {string} The encoded message.
   */
  run(input: string, args: unknown[]): string {
    const [alphabet, translation, keep, invert] = args as [
      string,
      string,
      boolean,
      boolean,
    ];
    const alphabetObject = BACON_ALPHABETS[alphabet];
    const charCodeA = "A".charCodeAt(0);
    const charCodeZ = "Z".charCodeAt(0);

    let output = input.replace(/./g, (c) => {
      const charCode = c.toUpperCase().charCodeAt(0);
      if (charCode >= charCodeA && charCode <= charCodeZ) {
        let code = charCode - charCodeA;
        if (alphabetObject.codes !== undefined) {
          code = alphabetObject.codes[code];
        }
        return ("00000" + code.toString(2)).slice(-5);
      }
      return c;
    });

    if (invert) {
      output = swapZeroAndOne(output);
    }
    if (!keep) {
      output = output.replace(/[^01]/g, "");
      const outputArray = output.match(/(.{5})/g) || [];
      output = outputArray.join(" ");
    }
    if (translation === BACON_TRANSLATION_AB) {
      output = output.replace(/[01]/g, (c) => (c === "0" ? "A" : "B"));
    }

    return output;
  }
}

export default BaconCipherEncode;
