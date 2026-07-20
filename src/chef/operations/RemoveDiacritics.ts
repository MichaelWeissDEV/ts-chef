/**
 * @fileoverview RemoveDiacritics operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";

/**
 * Remove Diacritics operation
 */
export class RemoveDiacritics extends TypedOperation<string, string, unknown[]> {
  /**
   * RemoveDiacritics constructor
   */
  constructor() {
    super();

    this.name = "Remove Diacritics";
    this.module = "Default";
    this.description =
      "Replaces accented characters with their latin character equivalent. Accented characters are made up of Unicode combining characters, so unicode text formatting such as strikethroughs and underlines will also be removed.";
    this.infoURL = "https://wikipedia.org/wiki/Diacritic";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, _args: unknown[]): string {
    // reference: https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript/37511463
    return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
}

export default RemoveDiacritics;
