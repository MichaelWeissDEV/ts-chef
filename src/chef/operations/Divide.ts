/**
 * @fileoverview Divide operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import BigNumber from "bignumber.js";
import { TypedOperation, AnyInput } from "../Operation_new";
import { div, createNumArray } from "../lib/Arithmetic";
import { ARITHMETIC_DELIM_OPTIONS } from "../lib/Delim";

/**
 * Divide operation
 */
export class Divide extends TypedOperation<string, AnyInput, unknown[]> {
  /**
   * Divide constructor
   */
  constructor() {
    super();

    this.name = "Divide";
    this.module = "Default";
    this.description =
      "Divides a list of numbers. If an item in the string is not a number it is excluded from the list.<br><br>e.g. <code>0x0a 8 .5</code> becomes <code>2.5</code>";
    this.inputType = "string";
    this.outputType = "BigNumber";
    this.args = [
      {
        name: "Delimiter",
        type: "option",
        value: ARITHMETIC_DELIM_OPTIONS,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {BigNumber}
   */
  run(input: string, args: unknown[]): AnyInput {
    const [arg0] = args as [string];
    const val = div(createNumArray(input, arg0));
    return BigNumber.isBigNumber(val) ? val : new BigNumber(NaN);
  }
}

export default Divide;
