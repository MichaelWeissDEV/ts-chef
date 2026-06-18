/**
 * @fileoverview FromModhex operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, AnyInput } from "../Operation";
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
  run(input: string, args: unknown[]): AnyInput {
    const [arg0] = args as [string];
    const delim = arg0 || "Auto";
    return fromModhex(input, delim, 2);
  }
}

export default FromModhex;
