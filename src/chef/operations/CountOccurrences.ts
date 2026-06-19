/**
 * @fileoverview CountOccurrences operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
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
export class CountOccurrences extends TypedOperation<string, number, ToggleStringArg[]> {
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
