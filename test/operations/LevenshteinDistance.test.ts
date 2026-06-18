/**
 * @fileoverview LevenshteinDistance.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { LevenshteinDistance } from "../../src/chef/operations/LevenshteinDistance";

describe("LevenshteinDistance", () => {
  const op = new LevenshteinDistance();

  test("Same strings have distance 0", () => {
    expect(op.run("hello\nhello", ["\n", 1, 1, 1])).toBe(0);
  });

  test("Completely different single chars have distance 1", () => {
    expect(op.run("a\nb", ["\n", 1, 1, 1])).toBe(1);
  });

  test("kitten → sitting has distance 3", () => {
    expect(op.run("kitten\nsitting", ["\n", 1, 1, 1])).toBe(3);
  });

  test("Empty string to 'abc' has distance 3", () => {
    expect(op.run("\nabc", ["\n", 1, 1, 1])).toBe(3);
  });

  test("Custom delimiter separates the two strings", () => {
    expect(op.run("abc|def", ["|", 1, 1, 1])).toBe(3);
  });
});
