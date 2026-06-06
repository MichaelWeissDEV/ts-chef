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
import { RADIX_DELIM_OPTIONS_TO, toRadix, defaultDigitLen } from "../lib/Radix";

export class ToRadix extends Operation {
  constructor() {
    super();
    this.name = "To Radix";
    this.module = "Default";
    this.description =
      "Converts bytes to a radix-encoded (base N) string. " +
      "Supports any base from 2 to 36. " +
      "Examples: bytes → 01100001,00110000 (binary, comma); " +
      "bytes → 61 30 (hex, space); bytes → 141 60 (octal, space).";
    this.infoURL = "https://wikipedia.org/wiki/Radix";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      {
        name: "Delimiter",
        type: "option",
        value: RADIX_DELIM_OPTIONS_TO,
      },
      {
        name: "Base",
        type: "number",
        value: 2,
        min: 2,
        max: 36,
      },
      {
        name: "Digit Length",
        type: "number",
        value: 8,
        min: 1,
      },
    ];
  }

  run(input: ArrayBuffer, args: unknown[]): string {
    const delimName = (args[0] as string) || "Space";
    const radix = (args[1] as number) || 2;
    const digitLen = (args[2] as number) || defaultDigitLen(radix);

    if (radix < 2 || radix > 36) {
      throw new OperationError("Base must be between 2 and 36");
    }

    return toRadix(input, delimName, radix, digitLen);
  }
}

export default ToRadix;
