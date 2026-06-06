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
import { DELIM_OPTIONS } from "../lib/Delim";
import { fromDecimal } from "../lib/Decimal";

export class FromDecimal extends Operation {
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
    if (args[1] as boolean) {
      data = data.map((v) => (v < 0 ? 0xff + v + 1 : v));
    }
    return data;
  }
}

export default FromDecimal;
