/**
 * @fileoverview ToBase operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, AnyInput } from "../Operation";
import OperationError from "../errors/OperationError";

/**
 * To Base operation
 */
export class ToBase extends Operation {
  /**
   * ToBase constructor
   */
  constructor() {
    super();

    this.name = "To Base";
    this.module = "Default";
    this.description = "Converts a decimal number to a given numerical base.";
    this.infoURL = "https://wikipedia.org/wiki/Radix";
    this.inputType = "BigNumber";
    this.outputType = "string";
    this.args = [
      {
        name: "Radix",
        type: "number",
        value: 36,
      },
    ];
  }

  /**
   * @param {BigNumber} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: AnyInput, args: unknown[]): AnyInput {
    const [radix] = args as [number];
    if (!input) {
      throw new OperationError("Error: Input must be a number");
    }
    if (radix < 2 || radix > 36) {
      throw new OperationError(
        "Error: Radix argument must be between 2 and 36",
      );
    }
    return input.toString(radix);
  }
}

export default ToBase;
