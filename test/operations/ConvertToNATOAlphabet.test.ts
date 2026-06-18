/**
 * @fileoverview ConvertToNATOAlphabet.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ConvertToNATOAlphabet } from "../../src/chef/operations/ConvertToNATOAlphabet";

describe("ConvertToNATOAlphabet", () => {
  const op = new ConvertToNATOAlphabet();

  test("Basic conversion", () => {
    expect(op.run("abc", [])).toBe("Alfa Bravo Charlie ");
  });

  test("Numbers and symbols", () => {
    expect(op.run("1,.", [])).toBe("One Comma Full stop ");
  });
});
