/**
 * @fileoverview ToKebabCase.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ToKebabCase } from "../../src/chef/operations/ToKebabCase";

describe("ToKebabCase", () => {
  const op = new ToKebabCase();

  test("Converts camelCase to kebab-case", () => {
    expect(op.run("helloWorld", [false])).toBe("hello-world");
  });

  test("Converts spaces to hyphens", () => {
    expect(op.run("hello world", [false])).toBe("hello-world");
  });

  test("Converts underscores to hyphens", () => {
    expect(op.run("hello_world", [false])).toBe("hello-world");
  });

  test("Lowercases the result", () => {
    expect(op.run("Hello World", [false])).toBe("hello-world");
  });

  test("Empty input", () => {
    expect(op.run("", [false])).toBe("");
  });
});
