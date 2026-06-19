/**
 * @fileoverview ToModhex operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import { TO_MODHEX_DELIM_OPTIONS, toModhex } from "../lib/Modhex";
import Utils from "../Utils";

/**
 * To Modhex operation
 */
export class ToModhex extends TypedOperation<AnyInput, AnyInput, unknown[]> {
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
  run(input: AnyInput, args: unknown[]): AnyInput {
    const [delimRaw, lineSize] = args as [string, number];
    const delim = Utils.charRep(delimRaw);

    return toModhex(
      new Uint8Array(input as ArrayBuffer),
      delim,
      2,
      "",
      lineSize,
    );
  }
}

export default ToModhex;
