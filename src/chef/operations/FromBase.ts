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
import BigNumber from "bignumber.js";
import OperationError from "../errors/OperationError";

/**
 * From Base operation
 */
export class FromBase extends Operation {
  /**
   * FromBase constructor
   */
  constructor() {
    super();

    this.name = "From Base";
    this.module = "Default";
    this.description =
      "Converts a number to decimal from a given numerical base.";
    this.infoURL = "https://wikipedia.org/wiki/Radix";
    this.inputType = "string";
    this.outputType = "BigNumber";
    this.args = [
      {
        name: "Radix",
        type: "number",
        value: 36,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {BigNumber}
   */
  run(input: any, args: any[]): any {
    const radix = args[0];
    if (radix < 2 || radix > 36) {
      throw new OperationError(
        "Error: Radix argument must be between 2 and 36",
      );
    }

    const number = input.replace(/\s/g, "").split(".");
    let result = new BigNumber(number[0], radix);

    if (number.length === 1) return result;

    // Fractional part
    for (let i = 0; i < number[1].length; i++) {
      const digit = new BigNumber(number[1][i], radix);
      result = result.plus(digit.div(Math.pow(radix, i + 1)));
    }

    return result;
  }
}

export default FromBase;
