/**
 * @fileoverview ToCharcode.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ToCharcode } from "../../src/chef/operations/ToCharcode";

describe("ToCharcode", () => {
  const op = new ToCharcode();

  test("Converts 'A' to charcode 65 (base 10)", () => {
    expect(op.run("A", ["Space", 10])).toBe("65");
  });

  test("Converts 'hello' to space-separated decimal charcodes", () => {
    expect(op.run("hello", ["Space", 10])).toBe("104 101 108 108 111");
  });

  test("Converts 'A' to hex charcode 41 (base 16)", () => {
    expect(op.run("A", ["Space", 16])).toBe("41");
  });

  test("Empty input returns empty string", () => {
    expect(op.run("", ["Space", 10])).toBe("");
  });

  test("Uses comma delimiter", () => {
    expect(op.run("AB", ["Comma", 10])).toBe("65,66");
  });
});
