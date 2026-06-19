/**
 * @fileoverview FromBraille operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput, HighlightPos, HighlightResult } from "../Operation";
import { BRAILLE_LOOKUP } from "../lib/Braille";

/**
 * From Braille operation
 */
export class FromBraille extends TypedOperation<string, AnyInput, unknown[]> {
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
  run(input: string, _args: unknown[]): AnyInput {
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
  highlight(pos: HighlightPos, _args: unknown[]): HighlightResult {
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
  highlightReverse(pos: HighlightPos, _args: unknown[]): HighlightResult {
    return pos;
  }
}

export default FromBraille;
