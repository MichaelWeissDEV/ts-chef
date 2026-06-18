/**
 * @fileoverview ToSnakeCase.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ToSnakeCase } from "../../src/chef/operations/ToSnakeCase";

describe("ToSnakeCase", () => {
  const op = new ToSnakeCase();

  test("Converts camelCase to snake_case", () => {
    expect(op.run("helloWorld", [false])).toBe("hello_world");
  });

  test("Converts spaces to underscores", () => {
    expect(op.run("hello world", [false])).toBe("hello_world");
  });

  test("Converts hyphens to underscores", () => {
    expect(op.run("hello-world", [false])).toBe("hello_world");
  });

  test("Lowercases the result", () => {
    expect(op.run("Hello World", [false])).toBe("hello_world");
  });

  test("Empty input", () => {
    expect(op.run("", [false])).toBe("");
  });
});
