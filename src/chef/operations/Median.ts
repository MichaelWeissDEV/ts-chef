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
import { median, createNumArray } from "../lib/Arithmetic";
import { ARITHMETIC_DELIM_OPTIONS } from "../lib/Delim";

export class Median extends Operation {
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
