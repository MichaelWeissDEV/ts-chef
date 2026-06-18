/**
 * @fileoverview RemoveLineNumbers.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { RemoveLineNumbers } from "../../src/chef/operations/RemoveLineNumbers";

describe("RemoveLineNumbers", () => {
  const op = new RemoveLineNumbers();

  test("Removes simple line numbers with dot", () => {
    const input = "1. foo\n2. bar\n3. baz";
    const result = op.run(input, []);
    expect(result).not.toMatch(/^\d+\./m);
  });

  test("Removes line numbers with colon", () => {
    const input = "1: hello\n2: world";
    const result = op.run(input, []);
    expect(result).not.toMatch(/^\d+:/m);
  });

  test("Leaves non-numbered lines unchanged", () => {
    expect(op.run("hello world", [])).toBe("hello world");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", [])).toBe("");
  });

  test("Removes line numbers with closing paren", () => {
    const input = "1) first\n2) second";
    const result = op.run(input, []);
    expect(result).not.toMatch(/^\d+\)/m);
  });
});
