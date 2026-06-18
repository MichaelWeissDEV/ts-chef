/**
 * @fileoverview Sort.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Sort } from "../../src/chef/operations/Sort";

describe("Sort", () => {
  const op = new Sort();

  test("Alphabetical sort", () => {
    expect(
      op.run("b\na\nc", ["Line feed", false, "Alphabetical (case sensitive)"]),
    ).toBe("a\nb\nc");
  });

  test("Reverse alphabetical sort", () => {
    expect(
      op.run("a\nb\nc", ["Line feed", true, "Alphabetical (case sensitive)"]),
    ).toBe("c\nb\na");
  });

  test("Numeric sort", () => {
    expect(op.run("10\n2\n1", ["Line feed", false, "Numeric"])).toBe(
      "1\n2\n10",
    );
  });

  test("Length sort", () => {
    expect(op.run("bb\na\nccc", ["Line feed", false, "Length"])).toBe(
      "a\nbb\nccc",
    );
  });

  test("Empty input returns empty", () => {
    expect(
      op.run("", ["Line feed", false, "Alphabetical (case sensitive)"]),
    ).toBe("");
  });
});
