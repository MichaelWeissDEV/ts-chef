/**
 * @fileoverview FromBase operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import BigNumber from "bignumber.js";
import OperationError from "../errors/OperationError";

/**
 * From Base operation
 */
export class FromBase extends TypedOperation<string, AnyInput, unknown[]> {
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
  run(input: string, args: unknown[]): AnyInput {
    const [arg0] = args as [number];
    const radix = arg0;
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
