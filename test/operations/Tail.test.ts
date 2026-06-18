/**
 * @fileoverview Tail.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Tail } from "../../src/chef/operations/Tail";

describe("Tail", () => {
  const op = new Tail();

  test("Returns last N lines", () => {
    expect(op.run("a\nb\nc\nd", ["Line", 2])).toBe("c\nd");
  });

  test("N=1 returns last line", () => {
    expect(op.run("first\nsecond\nthird", ["Line", 1])).toBe("third");
  });

  test("N greater than total returns all lines", () => {
    expect(op.run("a\nb", ["Line", 10])).toBe("a\nb");
  });

  test("Byte mode returns last N bytes", () => {
    expect(op.run("hello", ["Byte", 3])).toBe("llo");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", ["Line", 5])).toBe("");
  });
});
