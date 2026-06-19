/**
 * @fileoverview Median operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";
import BigNumber from "bignumber.js";
import { median, createNumArray } from "../lib/Arithmetic";
import { ARITHMETIC_DELIM_OPTIONS } from "../lib/Delim";

export class Median extends TypedOperation<string, BigNumber, unknown[]> {
  constructor() {
    super();
    this.name = "Median";
    this.module = "Default";
    this.description =
      "Computes the median of a number list. If an item in the string is not a number it is excluded from the list.<br><br>e.g. <code>0x0a 8 1 .5</code> becomes <code>4.5</code>";
    this.infoURL = "https://wikipedia.org/wiki/Median";
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
    const val = median(createNumArray(input, args[0] as string));
    return BigNumber.isBigNumber(val) ? val : new BigNumber(NaN);
  }
}

export default Median;
