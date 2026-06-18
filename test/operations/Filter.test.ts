/**
 * @fileoverview Filter.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Filter } from "../../src/chef/operations/Filter";

describe("Filter", () => {
  const op = new Filter();

  test("Keeps lines matching regex", () => {
    const input = "foo\nbar\nbaz";
    expect(op.run(input, ["Line feed", "^b", false])).toBe("bar\nbaz");
  });

  test("Inverted filter keeps non-matching lines", () => {
    const input = "foo\nbar\nbaz";
    expect(op.run(input, ["Line feed", "^b", true])).toBe("foo");
  });

  test("Empty regex keeps all lines", () => {
    const input = "foo\nbar";
    expect(op.run(input, ["Line feed", "", false])).toBe("foo\nbar");
  });

  test("No matching lines returns empty", () => {
    const input = "foo\nbar";
    expect(op.run(input, ["Line feed", "^z", false])).toBe("");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", ["Line feed", ".*", false])).toBe("");
  });
});
