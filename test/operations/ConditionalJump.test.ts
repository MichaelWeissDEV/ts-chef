/**
 * @fileoverview ConditionalJump.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ConditionalJump } from "../../src/chef/operations/ConditionalJump";
import Dish from "../../src/chef/Dish";

describe("ConditionalJump", () => {
  const operation = new ConditionalJump();

  function makeState(input: string, args: unknown[]) {
    const dish = new Dish();
    dish.set(input, "string");
    return {
      progress: 0,
      dish,
      opList: [
        { name: "Conditional Jump", ingValues: args },
        { name: "Label", ingValues: ["label1"] },
      ],
      numJumps: 0,
    };
  }

  test("jumps to the label when the regular expression matches", async () => {
    const state = makeState("test data", ["^test", false, "label1", 10]);
    await expect(operation.run(state)).resolves.toMatchObject({ progress: 1 });
    await expect(state.dish.get("string")).resolves.toBe("test data");
  });

  test("does not jump when the condition is false", async () => {
    const state = makeState("other data", ["^test", false, "label1", 10]);
    await expect(operation.run(state)).resolves.toMatchObject({ progress: 0 });
  });

  test("inverts the condition and reports invalid regular expressions", async () => {
    const inverted = makeState("other data", ["^test", true, "label1", 10]);
    await expect(operation.run(inverted)).resolves.toMatchObject({ progress: 1 });

    const invalid = makeState("data", ["[", false, "label1", 10]);
    await expect(operation.run(invalid)).rejects.toThrow(/invalid conditional-jump regex/i);
  });
});
