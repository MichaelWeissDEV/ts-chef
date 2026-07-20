/**
 * @fileoverview Jump operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import { getLabelIndex } from "../lib/FlowControl";

interface JumpState {
  progress: number;
  opList: Array<{ name: string; ingValues: [string, number] }>;
  numJumps: number;
}

/**
 * Jump operation
 */
export class Jump extends TypedOperation<JumpState, JumpState, unknown[]> {
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
  run(state: JumpState): JumpState {
    const ings = state.opList[state.progress].ingValues;
    const [label, maxJumps] = ings;
    const jmpIndex = getLabelIndex(label, state);

    if (jmpIndex === -1) {
      state.numJumps = 0;
      return state;
    }

    const backwards = jmpIndex <= state.progress;
    if (backwards && state.numJumps >= maxJumps) {
      state.numJumps = 0;
      return state;
    }

    state.progress = jmpIndex;
    state.numJumps = backwards ? state.numJumps + 1 : 0;
    return state;
  }
}

export default Jump;
