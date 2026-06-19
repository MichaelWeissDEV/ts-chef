/**
 * @fileoverview FuzzyMatch operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import {
  fuzzyMatch,
  calcMatchRanges,
  DEFAULT_WEIGHTS,
} from "../lib/FuzzyMatch";
import Utils from "../Utils";

/**
 * Fuzzy Match operation
 */
export class FuzzyMatch extends TypedOperation<string, AnyInput, unknown[]> {
  /**
   * FuzzyMatch constructor
   */
  constructor() {
    super();

    this.name = "Fuzzy Match";
    this.module = "Default";
    this.description =
      "Conducts a fuzzy search to find a pattern within the input based on weighted criteria.<br><br>e.g. A search for <code>dpan</code> will match on <code><b>D</b>on't <b>Pan</b>ic</code>";
    this.infoURL =
      "https://wikipedia.org/wiki/Fuzzy_matching_(computer-assisted_translation)";
    this.inputType = "string";
    this.outputType = "html";
    this.args = [
      {
        name: "Search",
        type: "binaryString",
        value: "",
      },
      {
        name: "Sequential bonus",
        type: "number",
        value: DEFAULT_WEIGHTS.sequentialBonus,
        hint: "Bonus for adjacent matches",
      },
      {
        name: "Separator bonus",
        type: "number",
        value: DEFAULT_WEIGHTS.separatorBonus,
        hint: "Bonus if match occurs after a separator",
      },
      {
        name: "Camel bonus",
        type: "number",
        value: DEFAULT_WEIGHTS.camelBonus,
        hint: "Bonus if match is uppercase and previous is lower",
      },
      {
        name: "First letter bonus",
        type: "number",
        value: DEFAULT_WEIGHTS.firstLetterBonus,
        hint: "Bonus if the first letter is matched",
      },
      {
        name: "Leading letter penalty",
        type: "number",
        value: DEFAULT_WEIGHTS.leadingLetterPenalty,
        hint: "Penalty applied for every letter in the input before the first match",
      },
      {
        name: "Max leading letter penalty",
        type: "number",
        value: DEFAULT_WEIGHTS.maxLeadingLetterPenalty,
        hint: "Maxiumum penalty for leading letters",
      },
      {
        name: "Unmatched letter penalty",
        type: "number",
        value: DEFAULT_WEIGHTS.unmatchedLetterPenalty,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {html}
   */
  run(input: string, args: unknown[]): AnyInput {
    const [arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7] = args as [
      unknown,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ];
    const searchStr = arg0 as string;
    const weights = {
      sequentialBonus: arg1,
      separatorBonus: arg2,
      camelBonus: arg3,
      firstLetterBonus: arg4,
      leadingLetterPenalty: arg5,
      maxLeadingLetterPenalty: arg6,
      unmatchedLetterPenalty: arg7,
    };
    const matches = fuzzyMatch(searchStr, input, true, weights);

    if (!matches) {
      return "No matches.";
    }

    let result = "",
      pos = 0,
      hlClass = "hl1";
    matches.forEach(([_matches, _score, idxs]) => {
      const matchRanges = calcMatchRanges(idxs);

      matchRanges.forEach(([start, length], i) => {
        result += Utils.escapeHtml(input.slice(pos, start));
        if (i === 0) result += `<span class="${hlClass}">`;
        pos = start + length;
        result += `<b>${Utils.escapeHtml(input.slice(start, pos))}</b>`;
      });
      result += "</span>";
      hlClass = hlClass === "hl1" ? "hl2" : "hl1";
    });

    result += Utils.escapeHtml(input.slice(pos, input.length));

    return result;
  }
}

export default FuzzyMatch;
