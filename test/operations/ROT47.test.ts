/**
 * @fileoverview ROT47.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ROT47 } from "../../src/chef/operations/ROT47";

describe("ROT47", () => {
  const op = new ROT47();

  const str = (s: string) => s.split("").map((c) => c.charCodeAt(0));
  const out = (arr: number[]) =>
    arr.map((c) => String.fromCharCode(c)).join("");

  test("Rotating 'Hello' by 47", () => {
    expect(out(op.run(str("Hello"), [47]))).toBe("w6==@");
  });

  test("Double rotation returns original", () => {
    const input = str("Test 123!");
    const once = op.run(input, [47]);
    const twice = op.run(once, [47]);
    expect(out(twice)).toBe("Test 123!");
  });

  test("Non-printable ASCII chars are unchanged", () => {
    const input = [9, 10, 32]; // tab, newline, space
    expect(op.run(input, [47])).toEqual([9, 10, 32]);
  });

  test("Empty input", () => {
    expect(op.run([], [47])).toEqual([]);
  });

  test("Amount of zero leaves input unchanged", () => {
    const input = str("abc");
    expect(op.run(input, [0])).toEqual(input);
  });
});
