/**
 * @fileoverview SymmetricDifference.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { SymmetricDifference } from "../../src/chef/operations/SymmetricDifference";

describe("SymmetricDifference", () => {
  const op = new SymmetricDifference();

  test("Symmetric difference excludes common elements", () => {
    const result = op.run("a,b,c\n\nb,c,d", ["\n\n", ","]);
    expect(result).toContain("a");
    expect(result).toContain("d");
    expect(result).not.toContain("b");
    expect(result).not.toContain("c");
  });

  test("Symmetric difference of identical sets is empty", () => {
    const result = op.run("a,b\n\na,b", ["\n\n", ","]);
    expect(result).toBe("");
  });

  test("Symmetric difference of disjoint sets is their union", () => {
    const result = op.run("a,b\n\nc,d", ["\n\n", ","]);
    expect(result).toContain("a");
    expect(result).toContain("b");
    expect(result).toContain("c");
    expect(result).toContain("d");
  });

  test("Less than two sets throws error", () => {
    expect(() => op.run("a,b", ["\n\n", ","])).toThrow();
  });

  test("Empty input returns empty", () => {
    expect(op.run("\n\n", ["\n\n", ","])).toBe("");
  });
});
