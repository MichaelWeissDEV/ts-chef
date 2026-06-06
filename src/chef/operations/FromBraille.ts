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
import { BRAILLE_LOOKUP } from "../lib/Braille";

/**
 * From Braille operation
 */
export class FromBraille extends Operation {
  /**
   * FromBraille constructor
   */
  constructor() {
    super();

    this.name = "From Braille";
    this.module = "Default";
    this.description = "Converts six-dot braille symbols to text.";
    this.infoURL = "https://wikipedia.org/wiki/Braille";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    return input
      .split("")
      .map((b: string) => {
        const idx = BRAILLE_LOOKUP.dot6.indexOf(b);
        return idx < 0 ? b : BRAILLE_LOOKUP.ascii[idx];
      })
      .join("");
  }

  /**
   * Highlight From Braille
   *
   * @param {Object[]} pos
   * @param {number} pos[].start
   * @param {number} pos[].end
   * @param {Object[]} args
   * @returns {Object[]} pos
   */
  highlight(pos: any, args: any[]): any {
    return pos;
  }

  /**
   * Highlight From Braille in reverse
   *
   * @param {Object[]} pos
   * @param {number} pos[].start
   * @param {number} pos[].end
   * @param {Object[]} args
   * @returns {Object[]} pos
   */
  highlightReverse(pos: any, args: any[]): any {
    return pos;
  }
}

export default FromBraille;
