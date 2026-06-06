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

/**
 * Return operation
 */
export class Return extends Operation {
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
  run(input: any, args: any[]): any {
    return input;
  }
}

export default Return;
