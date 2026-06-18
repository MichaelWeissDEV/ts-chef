/**
 * @fileoverview SetIntersection.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { SetIntersection } from "../../src/chef/operations/SetIntersection";

describe("SetIntersection", () => {
  const op = new SetIntersection();

  test("Intersection of overlapping sets", () => {
    const result = op.run("a,b,c\n\nb,c,d", ["\n\n", ","]);
    expect(result).toContain("b");
    expect(result).toContain("c");
    expect(result).not.toContain("a");
    expect(result).not.toContain("d");
  });

  test("Intersection of identical sets equals that set", () => {
    const result = op.run("a,b\n\na,b", ["\n\n", ","]);
    expect(result).toContain("a");
    expect(result).toContain("b");
  });

  test("Intersection of disjoint sets is empty", () => {
    const result = op.run("a,b\n\nc,d", ["\n\n", ","]);
    expect(result).toBe("");
  });

  test("Intersection with empty set is empty", () => {
    const result = op.run("a,b\n\n", ["\n\n", ","]);
    expect(result).toBe("");
  });

  test("Less than two sets throws error", () => {
    expect(() => op.run("a,b", ["\n\n", ","])).toThrow();
  });
});
