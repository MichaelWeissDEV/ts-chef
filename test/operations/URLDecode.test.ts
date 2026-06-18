/**
 * @fileoverview URLDecode.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { URLDecode } from "../../src/chef/operations/URLDecode";

describe("URLDecode", () => {
  const op = new URLDecode();

  test("Decodes percent-encoded spaces", () => {
    expect(op.run("hello%20world", [])).toBe("hello world");
  });

  test("Decodes plus sign as space", () => {
    expect(op.run("hello+world", [])).toBe("hello world");
  });

  test("Decodes encoded special characters", () => {
    expect(op.run("%3F%3D%26", [])).toBe("?=&");
  });

  test("Plain string is unchanged", () => {
    expect(op.run("hello123", [])).toBe("hello123");
  });

  test("Empty input", () => {
    expect(op.run("", [])).toBe("");
  });
});
