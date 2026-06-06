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
 * Remove Diacritics operation
 */
export class RemoveDiacritics extends Operation {
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
  run(input: any, args: any[]): any {
    // reference: https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript/37511463
    return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
}

export default RemoveDiacritics;
