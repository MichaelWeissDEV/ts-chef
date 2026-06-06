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
