/**
 * @fileoverview Sum.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Sum } from "../../src/chef/operations/Sum";

describe("Sum", () => {
  const op = new Sum();

  test("Sum of integers separated by newlines", () => {
    expect(op.run("1\n2\n3", ["Line feed"]).toNumber()).toBe(6);
  });

  test("Sum of a single number", () => {
    expect(op.run("42", ["Line feed"]).toNumber()).toBe(42);
  });

  test("Sum of space-separated numbers", () => {
    expect(op.run("10 20 30", ["Space"]).toNumber()).toBe(60);
  });

  test("Sum with comma delimiter", () => {
    expect(op.run("5,10,15", ["Comma"]).toNumber()).toBe(30);
  });

  test("Non-numeric tokens are ignored", () => {
    expect(op.run("1\nabc\n2", ["Line feed"]).toNumber()).toBe(3);
  });
});
