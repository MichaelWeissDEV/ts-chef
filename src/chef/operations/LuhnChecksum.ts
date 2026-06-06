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
import { OperationError } from "../errors/OperationError";

export class LuhnChecksum extends Operation {
  constructor() {
    super();
    this.name = "Luhn Checksum";
    this.module = "Default";
    this.description =
      "The Luhn mod N algorithm. An extension to the Luhn algorithm that works with sequences of values in any even-numbered base.";
    this.infoURL = "https://en.wikipedia.org/wiki/Luhn_mod_N_algorithm";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [{ name: "Radix", type: "number", value: 10 }];
  }

  checksum(inputStr: string, radix = 10): number {
    let even = false;
    return (
      inputStr
        .split("")
        .reverse()
        .reduce((acc, elem) => {
          let temp = parseInt(elem, radix);
          if (isNaN(temp)) {
            throw new Error(
              "Character: " + elem + " is not valid in radix " + radix + ".",
            );
          }
          if (even) {
            temp = 2 * temp;
            temp = Math.floor(temp / radix) + (temp % radix);
          }
          even = !even;
          return acc + temp;
        }, 0) % radix
    );
  }

  run(input: string, args: unknown[]): string {
    if (!input) return "";

    const radix = args[0] as number;

    if (radix < 2 || radix > 36) {
      throw new OperationError(
        "Error: Radix argument must be between 2 and 36",
      );
    }
    if (radix % 2 !== 0) {
      throw new OperationError("Error: Radix argument must be divisible by 2");
    }

    const checkSum = this.checksum(input, radix).toString(radix);
    let checkDigit: number | string = this.checksum(input + "0", radix);
    checkDigit = checkDigit === 0 ? 0 : radix - checkDigit;
    const checkDigitStr = (checkDigit as number).toString(radix);

    return `Checksum: ${checkSum}\nCheckdigit: ${checkDigitStr}\nLuhn Validated String: ${input + checkDigitStr}`;
  }
}

export default LuhnChecksum;
