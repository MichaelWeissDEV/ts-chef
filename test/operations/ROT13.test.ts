/**
 * @fileoverview ROT13.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ROT13 } from "../../src/chef/operations/ROT13";

describe("ROT13", () => {
  const op = new ROT13();

  const str = (s: string) => s.split("").map((c) => c.charCodeAt(0));
  const out = (arr: number[]) =>
    arr.map((c) => String.fromCharCode(c)).join("");

  test("Standard ROT13 of 'Hello'", () => {
    expect(out(op.run(str("Hello"), [true, true, false, 13]))).toBe("Uryyb");
  });

  test("Double ROT13 returns original", () => {
    const input = str("The quick brown fox");
    const once = op.run(input, [true, true, false, 13]);
    const twice = op.run(once, [true, true, false, 13]);
    expect(out(twice)).toBe("The quick brown fox");
  });

  test("Non-alpha chars are unchanged", () => {
    expect(out(op.run(str("123!@#"), [true, true, false, 13]))).toBe("123!@#");
  });

  test("Empty input", () => {
    expect(op.run([], [true, true, false, 13])).toEqual([]);
  });

  test("Custom rotation amount of 1", () => {
    expect(out(op.run(str("abc"), [true, false, false, 1]))).toBe("bcd");
  });
});
