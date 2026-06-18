/**
 * @fileoverview CSSBeautify.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { CSSBeautify } from "../../src/chef/operations/CSSBeautify";

describe("CSSBeautify", () => {
  const op = new CSSBeautify();

  test("Beautify simple CSS", () => {
    const input = "body{color:red;background:blue;}";
    const result = op.run(input, ["  "]); // 2 spaces indent
    expect(result).toBe("body{\n  color:red;\n  background:blue;\n}\n");
  });

  test("Beautify CSS with tabs", () => {
    const input = "body{color:red;}";
    const result = op.run(input, ["\t"]);
    expect(result).toBe("body{\n\tcolor:red;\n}\n");
  });

  test("Empty input", () => {
    const result = op.run("", ["  "]);
    expect(result).toBe("");
  });
});
