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
import OperationError from "../errors/OperationError";

/**
 * Generate De Bruijn Sequence operation
 */
export class GenerateDeBruijnSequence extends Operation {
  /**
   * GenerateDeBruijnSequence constructor
   */
  constructor() {
    super();

    this.name = "Generate De Bruijn Sequence";
    this.module = "Default";
    this.description =
      "Generates rolling keycode combinations given a certain alphabet size and key length.";
    this.infoURL = "https://wikipedia.org/wiki/De_Bruijn_sequence";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Alphabet size (k)",
        type: "number",
        value: 2,
      },
      {
        name: "Key length (n)",
        type: "number",
        value: 3,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const [k, n] = args;

    if (k < 2 || k > 9) {
      throw new OperationError(
        "Invalid alphabet size, required to be between 2 and 9 (inclusive).",
      );
    }

    if (n < 2) {
      throw new OperationError(
        "Invalid key length, required to be at least 2.",
      );
    }

    if (Math.pow(k, n) > 50000) {
      throw new OperationError(
        "Too many permutations, please reduce k^n to under 50,000.",
      );
    }

    const a = new Array(k * n).fill(0);
    const sequence = [];

    (function db(t = 1, p = 1) {
      if (t > n) {
        if (n % p !== 0) return;
        for (let j = 1; j <= p; j++) {
          sequence.push(a[j]);
        }
        return;
      }

      a[t] = a[t - p];
      db(t + 1, p);
      for (let j = a[t - p] + 1; j < k; j++) {
        a[t] = j;
        db(t + 1, t);
      }
    })();

    return sequence.join("");
  }
}

export default GenerateDeBruijnSequence;
