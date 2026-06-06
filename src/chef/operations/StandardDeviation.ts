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

import BigNumber from "bignumber.js";
import { Operation } from "../Operation";
import { stdDev, createNumArray } from "../lib/Arithmetic";
import { ARITHMETIC_DELIM_OPTIONS } from "../lib/Delim";

export class StandardDeviation extends Operation {
  constructor() {
    super();
    this.name = "Standard Deviation";
    this.module = "Default";
    this.description =
      "Computes the standard deviation of a number list. If an item in the string is not a number it is excluded from the list.";
    this.infoURL = "https://wikipedia.org/wiki/Standard_deviation";
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
    const val = stdDev(createNumArray(input, args[0] as string));
    return BigNumber.isBigNumber(val) ? val : new BigNumber(NaN);
  }
}

export default StandardDeviation;
