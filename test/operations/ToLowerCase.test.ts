/**
 * @fileoverview ToLowerCase.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ToLowerCase } from "../../src/chef/operations/ToLowerCase";

describe("ToLowerCase", () => {
  const op = new ToLowerCase();

  test("Converts uppercase to lowercase", () => {
    expect(op.run("HELLO WORLD", [])).toBe("hello world");
  });

  test("Already lowercase string stays the same", () => {
    expect(op.run("hello", [])).toBe("hello");
  });

  test("Mixed case", () => {
    expect(op.run("hElLo", [])).toBe("hello");
  });

  test("Numbers and symbols unchanged", () => {
    expect(op.run("ABC123!@#", [])).toBe("abc123!@#");
  });

  test("Empty input", () => {
    expect(op.run("", [])).toBe("");
  });
});
