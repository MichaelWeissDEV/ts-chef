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

/**
 * A1Z26 Cipher Encode operation
 *
 * @category Ciphers
 */
export class A1Z26CipherEncode extends Operation {
  /**
   * A1Z26CipherEncode constructor
   */
  constructor() {
    super();
    this.name = "A1Z26 Cipher Encode";
    this.module = "Ciphers";
    this.description =
      "Converts alphabet characters into their corresponding alphabet order number.\n\ne.g. a becomes 1 and b becomes 2.\n\nNon-alphabet characters are dropped.";
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
    const sanitized = input.toLowerCase();
    const charcode = Utils.strToCharcode(sanitized);
    const parts: string[] = [];

    for (let i = 0; i < charcode.length; i++) {
      const ordinal = charcode[i] - 96;
      if (ordinal > 0 && ordinal <= 26) {
        parts.push(ordinal.toString(10));
      }
    }

    return parts.join(delim);
  }
}

export default A1Z26CipherEncode;
