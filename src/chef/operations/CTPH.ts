/**
 * @fileoverview CTPH operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import * as ctphjs from "ctph.js";

/**
 * CTPH operation
 *
 * @category Hashing
 * @see https://forensics.wiki/context_triggered_piecewise_hashing/
 */
export class CTPH extends TypedOperation<string, string, unknown[]> {
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
  run(input: string, _args: unknown[]): string {
    return ctphjs.digest(input);
  }
}

export default CTPH;
