/**
 * @fileoverview ExpandAlphabetRange.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ExpandAlphabetRange } from "../../src/chef/operations/ExpandAlphabetRange";

describe("ExpandAlphabetRange", () => {
  const op = new ExpandAlphabetRange();

  test("Expands a-z to full alphabet with no delimiter", () => {
    expect(op.run("a-z", [""])).toBe("abcdefghijklmnopqrstuvwxyz");
  });

  test("Expands a-e range", () => {
    expect(op.run("a-e", [""])).toBe("abcde");
  });

  test("Uses specified delimiter between chars", () => {
    expect(op.run("a-c", [","])).toBe("a,b,c");
  });

  test("Expands digit range 0-9", () => {
    expect(op.run("0-9", [""])).toBe("0123456789");
  });

  test("Single char with no range is passed through", () => {
    expect(op.run("a", [""])).toBe("a");
  });
});
