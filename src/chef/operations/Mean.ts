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
import { mean, createNumArray } from "../lib/Arithmetic";
import { ARITHMETIC_DELIM_OPTIONS } from "../lib/Delim";

export class Mean extends Operation {
  constructor() {
    super();
    this.name = "Mean";
    this.module = "Default";
    this.description =
      "Computes the mean (average) of a number list. If an item in the string is not a number it is excluded from the list.<br><br>e.g. <code>0x0a 8 .5 .5</code> becomes <code>4.75</code>";
    this.infoURL = "https://wikipedia.org/wiki/Arithmetic_mean";
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
    const val = mean(createNumArray(input, args[0] as string));
    return BigNumber.isBigNumber(val) ? val : new BigNumber(NaN);
  }
}

export default Mean;
