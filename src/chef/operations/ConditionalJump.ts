/**
 * @fileoverview ConditionalJump operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, ArgConfig } from "../Operation";
import Dish from "../Dish";
import { getLabelIndex } from "../lib/FlowControl";

/**
 * Conditional Jump operation
 *
 * @category Default
 */
interface ConditionalJumpState {
  progress: number;
  dish: Dish;
  opList: Array<{ name: string; ingValues: unknown[] }>;
  numJumps: number;
}

export class ConditionalJump extends TypedOperation<
  ConditionalJumpState,
  ConditionalJumpState,
  unknown[]
> {
  name = "Conditional Jump";
  module = "Default";
  description =
    "Conditionally jump forwards or backwards to the specified Label based on whether the data matches the specified regular expression.";
  inputType = "string";
  outputType = "string";
  flowControl = true;
  args: ArgConfig[] = [
    {
      name: "Match (regex)",
      type: "string",
      value: "",
    },
    {
      name: "Invert match",
      type: "boolean",
      value: false,
    },
    {
      name: "Label name",
      type: "shortString",
      value: "",
    },
    {
      name: "Maximum jumps (if jumping backwards)",
      type: "number",
      value: 10,
    },
  ];

  /**
   * @param {string} input
   * @param {any[]} _args
   * @returns {string}
   */
  async run(state: ConditionalJumpState): Promise<ConditionalJumpState> {
    const [pattern, invert, label, maxJumps] = state.opList[state.progress]
      .ingValues as [string, boolean, string, number];
    const input = String(await state.dish.get(Dish.STRING));
    let matched: boolean;
    try {
      matched = new RegExp(pattern).test(input);
    } catch (error) {
      throw new TypeError(`Invalid conditional-jump regex: ${pattern}`, {
        cause: error,
      });
    }
    if (invert ? matched : !matched) return state;

    const jumpIndex = getLabelIndex(label, state);
    if (jumpIndex === -1) {
      state.numJumps = 0;
      return state;
    }
    const backwards = jumpIndex <= state.progress;
    if (backwards && state.numJumps >= maxJumps) {
      state.numJumps = 0;
      return state;
    }
    state.progress = jumpIndex;
    state.numJumps = backwards ? state.numJumps + 1 : 0;
    return state;
  }
}

export default ConditionalJump;
