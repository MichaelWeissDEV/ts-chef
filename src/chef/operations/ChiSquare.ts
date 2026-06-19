/**
 * @fileoverview ChiSquare operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";

/**
 * Chi Square operation
 *
 * @category Default
 */
export class ChiSquare extends TypedOperation<ArrayBuffer, number, unknown[]> {
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
