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
 * Alternating Caps operation
 *
 * @category Default
 */
export class AlternatingCaps extends Operation {
  /**
   * AlternatingCaps constructor
   */
  constructor() {
    super();
    this.name = "Alternating Caps";
    this.module = "Default";
    this.description =
      "Alternating caps, also known as studly caps, sticky caps, or spongecase is a form of text notation in which the capitalization of letters varies by some pattern, or arbitrarily. An example would be spelling 'alternative caps' as 'aLtErNaTiNg CaPs'.";
    this.infoURL = "https://en.wikipedia.org/wiki/Alternating_caps";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * Runs the Alternating Caps operation.
   *
   * @param {string} input
   * @param {unknown[]} _args
   * @returns {string}
   */
  run(input: string, _args: unknown[]): string {
    let output = "";
    let previousCaps = true;

    for (let i = 0; i < input.length; i++) {
      if (!/^\p{L}/u.test(input[i])) {
        output += input[i];
      } else if (previousCaps) {
        output += input[i].toLowerCase();
        previousCaps = false;
      } else {
        output += input[i].toUpperCase();
        previousCaps = true;
      }
    }
    return output;
  }
}

export default AlternatingCaps;
