/**
 * @fileoverview Substitute.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Substitute } from "../../src/chef/operations/Substitute";

describe("Substitute", () => {
  const op = new Substitute();

  test("Substitutes a to b", () => {
    expect(
      op.run("hello", [
        "abcdefghijklmnopqrstuvwxyz",
        "bcdefghijklmnopqrstuvwxyza",
        false,
      ]),
    ).toBe("ifmmp");
  });

  test("Identity substitution leaves string unchanged", () => {
    expect(op.run("hello", ["abc", "abc", false])).toBe("hello");
  });

  test("Case sensitive by default", () => {
    expect(
      op.run("Hello", [
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "BCDEFGHIJKLMNOPQRSTUVWXYZA",
        false,
      ]),
    ).toBe("Iello");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", ["abc", "xyz", false])).toBe("");
  });

  test("Characters not in plaintext are unchanged", () => {
    expect(op.run("a!b", ["ab", "xy", false])).toBe("x!y");
  });
});
