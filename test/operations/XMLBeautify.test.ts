/**
 * @fileoverview XMLBeautify.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { XMLBeautify } from "../../src/chef/operations/XMLBeautify";

describe("XMLBeautify", () => {
  const op = new XMLBeautify();

  test("Beautifies minified XML", () => {
    const result = op.run("<root><child>text</child></root>", ["  "]);
    expect(result).toContain("\n");
  });

  test("Result contains original content", () => {
    const result = op.run("<a><b>hello</b></a>", ["  "]);
    expect(result).toContain("hello");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", ["  "])).toBe("");
  });

  test("Plain text without XML is returned as-is", () => {
    const result = op.run("just text", ["  "]);
    expect(result).toContain("just text");
  });

  test("Custom indentation is applied", () => {
    const result = op.run("<root><child>x</child></root>", ["    "]);
    expect(result).toContain("    ");
  });
});
