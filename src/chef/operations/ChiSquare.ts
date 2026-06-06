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
 * Chi Square operation
 *
 * @category Default
 */
export class ChiSquare extends Operation {
  constructor() {
    super();
    this.name = "Chi Square";
    this.module = "Default";
    this.description = "Calculates the Chi Square distribution of values.";
    this.infoURL = "https://wikipedia.org/wiki/Chi-squared_distribution";
    this.inputType = "ArrayBuffer";
    this.outputType = "number";
    this.args = [];
  }

  /**
   * Runs the Chi Square operation.
   *
   * @param {ArrayBuffer} input - The input data to analyze.
   * @param {unknown[]} _args - Unused arguments.
   * @returns {number} - The Chi Square value.
   */
  run(input: ArrayBuffer, _args: unknown[]): number {
    const data = new Uint8Array(input);
    const distArray = new Array(256).fill(0);
    let total = 0;

    for (let i = 0; i < data.length; i++) {
      distArray[data[i]]++;
    }

    for (let i = 0; i < distArray.length; i++) {
      if (distArray[i] > 0) {
        total +=
          Math.pow(distArray[i] - data.length / 256, 2) / (data.length / 256);
      }
    }

    return total;
  }
}

export default ChiSquare;
