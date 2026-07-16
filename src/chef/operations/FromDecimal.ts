/**
 * @fileoverview FromDecimal operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import { DELIM_OPTIONS } from "../lib/Delim";
import { fromDecimal } from "../lib/Decimal";
import { OperationError } from "../errors/OperationError";

export class FromDecimal extends TypedOperation<string, number[], unknown[]> {
  constructor() {
    super();
    this.name = "From Decimal";
    this.module = "Default";
    this.description =
      "Converts the data from an ordinal integer array back into its raw form. e.g. 72 101 108 108 111 becomes Hello";
    this.inputType = "string";
    this.outputType = "byteArray";
    this.args = [
      {
        name: "Delimiter",
        type: "option",
        value: DELIM_OPTIONS,
      },
      {
        name: "Support signed values",
        type: "boolean",
        value: false,
      },
    ];
  }

  run(input: string, args: unknown[]): number[] {
    let data = fromDecimal(input, args[0] as string);
    const signed = args[1] as boolean;
    data = data.map((value, index) => {
      const minimum = signed ? -128 : 0;
      if (value < minimum || value > 255) {
        throw new OperationError(
          `Value ${value} at token ${index + 1} is outside ${signed ? "the signed/unsigned byte range -128–255" : "the byte range 0–255"}`,
        );
      }
      return signed && value < 0 ? 0x100 + value : value;
    });
    if (signed) {
      return data;
    }
    return data;
  }
}

export default FromDecimal;
