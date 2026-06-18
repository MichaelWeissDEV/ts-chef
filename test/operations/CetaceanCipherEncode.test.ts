/**
 * @fileoverview CetaceanCipherEncode.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { CetaceanCipherEncode } from "../../src/chef/operations/CetaceanCipherEncode";

describe("CetaceanCipherEncode", () => {
  const op = new CetaceanCipherEncode();

  test("Standard encoding ('hi')", () => {
    expect(op.run("hi", [])).toBe("EEEEEEEEEeeEeEEEEEEEEEEEEeeEeEEe");
  });

  test("Encoding with space", () => {
    expect(op.run("h i", [])).toBe("EEEEEEEEEeeEeEEE EEEEEEEEEeeEeEEe");
  });

  test("Empty input", () => {
    expect(op.run("", [])).toBe("");
  });
});
