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
import { SPLIT_DELIM_OPTIONS, JOIN_DELIM_OPTIONS } from "../lib/Delim";

export class Split extends Operation {
  constructor() {
    super();
    this.name = "Split";
    this.module = "Default";
    this.description =
      "Splits a string into sections around a given delimiter.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Split delimiter",
        type: "editableOptionShort",
        value: SPLIT_DELIM_OPTIONS,
      },
      {
        name: "Join delimiter",
        type: "editableOptionShort",
        value: JOIN_DELIM_OPTIONS,
      },
    ];
  }

  run(input: string, args: unknown[]): string {
    const [splitDelim, joinDelim] = args as [string, string];
    return input.split(splitDelim).join(joinDelim);
  }
}

export default Split;
