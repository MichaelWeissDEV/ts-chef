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

import Operation from "../Operation";

/**
 * CTPH operation
 *
 * @category Hashing
 * @see https://forensics.wiki/context_triggered_piecewise_hashing/
 */
export class CTPH extends Operation {
  /**
   * CTPH constructor
   */
  constructor() {
    super();

    this.name = "CTPH";
    this.module = "Crypto";
    this.description =
      "Context Triggered Piecewise Hashing, also called Fuzzy Hashing, can match inputs that have homologies. Such inputs have sequences of identical bytes in the same order, although bytes in between these sequences may be different in both content and length.<br><br>CTPH was originally based on the work of Dr. Andrew Tridgell and a spam email detector called SpamSum. This method was adapted by Jesse Kornblum and published at the DFRWS conference in 2006 in a paper 'Identifying Almost Identical Files Using Context Triggered Piecewise Hashing'.";
    this.infoURL =
      "https://forensics.wiki/context_triggered_piecewise_hashing/";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * @param {string} input - The string to hash.
   * @param {any[]} args - Operation arguments (none).
   * @returns {string} - The fuzzy hash.
   */
  run(input: string, args: any[]): string {
    const ctphjs = require("ctph.js");
    return ctphjs.digest(input);
  }
}

export default CTPH;
