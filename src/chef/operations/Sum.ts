/**
 * @fileoverview Sum operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import BigNumber from "bignumber.js";
import { TypedOperation } from "../Operation_new";
import { sum, createNumArray } from "../lib/Arithmetic";
import { ARITHMETIC_DELIM_OPTIONS } from "../lib/Delim";

export class Sum extends TypedOperation<string, BigNumber, unknown[]> {
  constructor() {
    super();
    this.name = "Sum";
    this.module = "Default";
    this.description =
      "Adds together a list of numbers. If an item in the string is not a number it is excluded from the list.";
    this.infoURL = "https://wikipedia.org/wiki/Summation";
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

  run(input: string, args: unknown[]): BigNumber {
    const val = sum(createNumArray(input, args[0] as string));
    return BigNumber.isBigNumber(val) ? val : new BigNumber(NaN);
  }
}

export default Sum;
