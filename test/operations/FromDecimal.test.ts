/**
 * @fileoverview FromDecimal.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { FromDecimal } from "../../src/chef/operations/FromDecimal";

describe("FromDecimal", () => {
  const op = new FromDecimal();

  const out = (arr: number[]) => Buffer.from(arr).toString("utf8");

  test("Converts decimal 65 to 'A'", () => {
    expect(out(op.run("65", ["Space", false]))).toBe("A");
  });

  test("Converts space-separated decimals to 'hi'", () => {
    expect(out(op.run("104 105", ["Space", false]))).toBe("hi");
  });

  test("Comma-delimited decimals", () => {
    expect(out(op.run("65,66,67", ["Comma", false]))).toBe("ABC");
  });

  test("Empty input returns empty array", () => {
    expect(op.run("", ["Space", false])).toEqual([]);
  });

  test("Converts 0 to null byte", () => {
    expect(op.run("0", ["Space", false])).toEqual([0]);
  });

  test("ignores repeated delimiters instead of inserting NUL bytes", () => {
    expect(op.run("65  66", ["Space", false])).toEqual([65, 66]);
  });

  test("rejects invalid and out-of-range decimal bytes", () => {
    expect(() => op.run("65 nope 66", ["Space", false])).toThrow();
    expect(() => op.run("256", ["Space", false])).toThrow();
    expect(() => op.run("-1", ["Space", false])).toThrow();
    expect(op.run("-1 -128", ["Space", true])).toEqual([255, 128]);
    expect(() => op.run("-129", ["Space", true])).toThrow();
  });
});
