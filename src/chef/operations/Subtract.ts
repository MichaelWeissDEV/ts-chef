/**
 * @fileoverview Subtract operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import BigNumber from "bignumber.js";
import { Operation } from "../Operation";
import { sub, createNumArray } from "../lib/Arithmetic";
import { ARITHMETIC_DELIM_OPTIONS } from "../lib/Delim";

export class Subtract extends Operation {
  constructor() {
    super();
    this.name = "Subtract";
    this.module = "Default";
    this.description =
      "Subtracts a list of numbers. If an item in the string is not a number it is excluded from the list.";
    this.infoURL = "https://wikipedia.org/wiki/Subtraction";
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
    const val = sub(createNumArray(input, args[0] as string));
    return BigNumber.isBigNumber(val) ? val : new BigNumber(NaN);
  }
}

export default Subtract;
