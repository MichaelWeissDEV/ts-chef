/**
 * @fileoverview ConditionalJump.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ConditionalJump } from "../../src/chef/operations/ConditionalJump";

describe("ConditionalJump", () => {
  const operation = new ConditionalJump();

  test("should return input unchanged (logic is handled by Recipe runner)", () => {
    const input = "test data";
    const args = ["^test", false, "label1", 10];
    expect(operation.run(input, args)).toBe(input);
  });

  test("should return input unchanged with inverted match", () => {
    const input = "other data";
    const args = ["^test", true, "label1", 10];
    expect(operation.run(input, args)).toBe(input);
  });
});
