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
import { FROM_MODHEX_DELIM_OPTIONS, fromModhex } from "../lib/Modhex";

/**
 * From Modhex operation
 */
export class FromModhex extends Operation {
  /**
   * FromModhex constructor
   */
  constructor() {
    super();

    this.name = "From Modhex";
    this.module = "Default";
    this.description = "Converts a modhex byte string back into its raw value.";
    this.infoURL = "https://en.wikipedia.org/wiki/YubiKey#ModHex";
    this.inputType = "string";
    this.outputType = "byteArray";
    this.args = [
      {
        name: "Delimiter",
        type: "option",
        value: FROM_MODHEX_DELIM_OPTIONS,
      },
    ];
    this.checks = [
      {
        pattern: "^(?:[cbdefghijklnrtuv]{2})+$",
        flags: "i",
        args: ["None"],
      },
      {
        pattern: "^[cbdefghijklnrtuv]{2}(?: [cbdefghijklnrtuv]{2})*$",
        flags: "i",
        args: ["Space"],
      },
      {
        pattern: "^[cbdefghijklnrtuv]{2}(?:,[cbdefghijklnrtuv]{2})*$",
        flags: "i",
        args: ["Comma"],
      },
      {
        pattern: "^[cbdefghijklnrtuv]{2}(?:;[cbdefghijklnrtuv]{2})*$",
        flags: "i",
        args: ["Semi-colon"],
      },
      {
        pattern: "^[cbdefghijklnrtuv]{2}(?::[cbdefghijklnrtuv]{2})*$",
        flags: "i",
        args: ["Colon"],
      },
      {
        pattern: "^[cbdefghijklnrtuv]{2}(?:\\n[cbdefghijklnrtuv]{2})*$",
        flags: "i",
        args: ["Line feed"],
      },
      {
        pattern: "^[cbdefghijklnrtuv]{2}(?:\\r\\n[cbdefghijklnrtuv]{2})*$",
        flags: "i",
        args: ["CRLF"],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {byteArray}
   */
  run(input: any, args: any[]): any {
    const delim = args[0] || "Auto";
    return fromModhex(input, delim, 2);
  }
}

export default FromModhex;
