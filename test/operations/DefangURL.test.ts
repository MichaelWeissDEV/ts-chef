/**
 * @fileoverview DefangURL.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { DefangURL } from "../../src/chef/operations/DefangURL";

describe("DefangURL", () => {
  const op = new DefangURL();

  test("Defangs http:// to hxxp://", () => {
    const result = op.run("http://example.com", [
      true,
      true,
      true,
      "Valid domains and full URLs",
    ]);
    expect(result).toContain("hxxp");
  });

  test("Replaces dots with [.]", () => {
    const result = op.run("example.com", [
      true,
      true,
      true,
      "Valid domains and full URLs",
    ]);
    expect(result).toContain("[.]");
  });

  test("Replaces :// with [://]", () => {
    const result = op.run("http://example.com", [
      true,
      true,
      true,
      "Valid domains and full URLs",
    ]);
    expect(result).toContain("[://]");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", [true, true, true, "Valid domains and full URLs"])).toBe(
      "",
    );
  });

  test("Plain text without URL is unchanged", () => {
    const result = op.run("hello world", [
      true,
      true,
      true,
      "Valid domains and full URLs",
    ]);
    expect(result).toBe("hello world");
  });
});
