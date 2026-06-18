/**
 * @fileoverview FromOctal.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { FromOctal } from "../../src/chef/operations/FromOctal";

describe("FromOctal", () => {
  const op = new FromOctal();

  const out = (arr: number[]) => Buffer.from(arr).toString("utf8");

  test("Converts octal 101 to 'A'", () => {
    expect(out(op.run("101", ["Space"]))).toBe("A");
  });

  test("Converts space-separated octals to 'AB'", () => {
    expect(out(op.run("101 102", ["Space"]))).toBe("AB");
  });

  test("Converts octal 110 145 154 154 157 to 'Hello'", () => {
    expect(out(op.run("110 145 154 154 157", ["Space"]))).toBe("Hello");
  });

  test("Empty input returns empty array", () => {
    expect(op.run("", ["Space"])).toEqual([]);
  });

  test("Converts octal 0 to null byte", () => {
    expect(op.run("0", ["Space"])).toEqual([0]);
  });
});
