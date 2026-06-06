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
import { getLabelIndex } from "../lib/FlowControl";

/**
 * Jump operation
 */
export class Jump extends Operation {
  /**
   * Jump constructor
   */
  constructor() {
    super();

    this.name = "Jump";
    this.flowControl = true;
    this.module = "Default";
    this.description = "Jump forwards or backwards to the specified Label";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Label name",
        type: "string",
        value: "",
      },
      {
        name: "Maximum jumps (if jumping backwards)",
        type: "number",
        value: 10,
      },
    ];
  }

  /**
   * @param {Object} state - The current state of the recipe.
   * @param {number} state.progress - The current position in the recipe.
   * @param {Dish} state.dish - The Dish being operated on.
   * @param {Operation[]} state.opList - The list of operations in the recipe.
   * @param {number} state.numJumps - The number of jumps taken so far.
   * @returns {Object} The updated state of the recipe.
   */
  run(state: any) {
    const ings = state.opList[state.progress].ingValues;
    const [label, maxJumps] = ings;
    const jmpIndex = getLabelIndex(label, state);

    if (state.numJumps >= maxJumps || jmpIndex === -1) {
      state.numJumps = 0;
      return state;
    }

    state.progress = jmpIndex;
    state.numJumps++;
    return state;
  }
}

export default Jump;
