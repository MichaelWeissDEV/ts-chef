/**
 * @fileoverview CSSMinify.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { CSSMinify } from "../../src/chef/operations/CSSMinify";

describe("CSSMinify", () => {
  const op = new CSSMinify();

  test("Minify simple CSS", () => {
    const input = "body {\n  color: red;\n  background: blue;\n}";
    const result = op.run(input, [false]);
    expect(result).toBe("body {color: red;background: blue;}");
  });

  test("Minify CSS with comments (stripped)", () => {
    const input = "/* comment */ body { color: red; }";
    const result = op.run(input, [false]);
    expect(result).toBe(" body {color: red;}");
  });

  test("Minify CSS with comments (preserved)", () => {
    const input = "/* comment */ body { color: red; }";
    const result = op.run(input, [true]);
    expect(result).toBe("/*comment */body {color: red;}");
  });

  test("Empty input", () => {
    const result = op.run("", [false]);
    expect(result).toBe("");
  });
});
