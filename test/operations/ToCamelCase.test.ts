/**
 * @fileoverview ToCamelCase.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ToCamelCase } from "../../src/chef/operations/ToCamelCase";

describe("ToCamelCase", () => {
  const op = new ToCamelCase();

  test("Converts hyphen-separated to camelCase", () => {
    expect(op.run("hello-world", [false])).toBe("helloWorld");
  });

  test("Converts space-separated to camelCase", () => {
    expect(op.run("hello world", [false])).toBe("helloWorld");
  });

  test("Converts underscore-separated to camelCase", () => {
    expect(op.run("hello_world", [false])).toBe("helloWorld");
  });

  test("Already camelCase stays camelCase", () => {
    expect(op.run("helloWorld", [false])).toBe("helloWorld");
  });

  test("Empty input", () => {
    expect(op.run("", [false])).toBe("");
  });
});
