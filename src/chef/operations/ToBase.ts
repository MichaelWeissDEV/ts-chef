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
 * To Base operation
 */
export class ToBase extends Operation {
  /**
   * ToBase constructor
   */
  constructor() {
    super();

    this.name = "To Base";
    this.module = "Default";
    this.description = "Converts a decimal number to a given numerical base.";
    this.infoURL = "https://wikipedia.org/wiki/Radix";
    this.inputType = "BigNumber";
    this.outputType = "string";
    this.args = [
      {
        name: "Radix",
        type: "number",
        value: 36,
      },
    ];
  }

  /**
   * @param {BigNumber} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    if (!input) {
      throw new OperationError("Error: Input must be a number");
    }
    const radix = args[0];
    if (radix < 2 || radix > 36) {
      throw new OperationError(
        "Error: Radix argument must be between 2 and 36",
      );
    }
    return input.toString(radix);
  }
}

export default ToBase;
