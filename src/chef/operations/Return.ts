/**
 * @fileoverview Return operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";

/**
 * Return operation
 */
export class Return extends TypedOperation<AnyInput, AnyInput, unknown[]> {
  /**
   * Return constructor
   */
  constructor() {
    super();

    this.name = "Return";
    this.flowControl = true;
    this.module = "Default";
    this.description =
      "End execution of operations at this point in the recipe.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * @param {Object} state - The current state of the recipe.
   * @param {number} state.progress - The current position in the recipe.
   * @param {Dish} state.dish - The Dish being operated on.
   * @param {Operation[]} state.opList - The list of operations in the recipe.
   * @returns {Object} The updated state of the recipe.
   */
  run(input: AnyInput, _args: unknown[]): AnyInput {
    return input;
  }
}

export default Return;
