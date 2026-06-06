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
import { TO_MODHEX_DELIM_OPTIONS, toModhex } from "../lib/Modhex";
import Utils from "../Utils";

/**
 * To Modhex operation
 */
export class ToModhex extends Operation {
  /**
   * ToModhex constructor
   */
  constructor() {
    super();

    this.name = "To Modhex";
    this.module = "Default";
    this.description =
      "Converts the input string to modhex bytes separated by the specified delimiter.";
    this.infoURL = "https://en.wikipedia.org/wiki/YubiKey#ModHex";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      {
        name: "Delimiter",
        type: "option",
        value: TO_MODHEX_DELIM_OPTIONS,
      },
      {
        name: "Bytes per line",
        type: "number",
        value: 0,
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const delim = Utils.charRep(args[0]);
    const lineSize = args[1];

    return toModhex(new Uint8Array(input), delim, 2, "", lineSize);
  }
}

export default ToModhex;
