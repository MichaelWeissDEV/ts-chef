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
import { RADIX_DELIM_OPTIONS, fromRadix, defaultDigitLen } from "../lib/Radix";

export class FromRadix extends Operation {
  constructor() {
    super();
    this.name = "From Radix";
    this.module = "Default";
    this.description =
      "Converts a radix-encoded (base N) string back into bytes. " +
      "Supports any base from 2 to 36 with automatic or explicit delimiter detection. " +
      "Examples: binary with comma: 01100001,00110000 → bytes (a0); " +
      "octal with space: 141 60 → bytes; hex with colon: 61:30 → bytes.";
    this.infoURL = "https://wikipedia.org/wiki/Radix";
    this.inputType = "string";
    this.outputType = "byteArray";
    this.args = [
      {
        name: "Delimiter",
        type: "option",
        value: RADIX_DELIM_OPTIONS,
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
        hint: "Used only when Delimiter is None (fixed-width tokens)",
      },
    ];
  }

  run(input: string, args: unknown[]): number[] {
    const delimName = (args[0] as string) || "Auto";
    const radix = (args[1] as number) || 2;
    const digitLen = (args[2] as number) || defaultDigitLen(radix);

    if (radix < 2 || radix > 36) {
      throw new OperationError("Base must be between 2 and 36");
    }

    return fromRadix(input, delimName, radix, digitLen);
  }
}

export default FromRadix;
