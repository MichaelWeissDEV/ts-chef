/**
 * @fileoverview Split operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import { SPLIT_DELIM_OPTIONS, JOIN_DELIM_OPTIONS } from "../lib/Delim";

export class Split extends TypedOperation<string, string, unknown[]> {
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
