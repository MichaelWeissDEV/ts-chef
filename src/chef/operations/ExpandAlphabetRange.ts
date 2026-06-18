/**
 * @fileoverview ExpandAlphabetRange operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation } from "../Operation";
import { Utils } from "../Utils";

export class ExpandAlphabetRange extends Operation {
  constructor() {
    super();
    this.name = "Expand alphabet range";
    this.module = "Default";
    this.description =
      "Expand an alphabet range string into a list of the characters in that range. e.g. a-z becomes abcdefghijklmnopqrstuvwxyz.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Delimiter",
        type: "binaryString",
        value: "",
      },
    ];
  }

  run(input: string, args: string[]): string {
    return Utils.expandAlphRange(input).join(args[0]);
  }
}

export default ExpandAlphabetRange;
