/**
 * @fileoverview GetAllCasings.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { GetAllCasings } from "../../src/chef/operations/GetAllCasings";

describe("GetAllCasings", () => {
  const op = new GetAllCasings();

  test("Single char produces lowercase and uppercase", () => {
    const result = op.run("a", []);
    expect(result).toContain("a");
    expect(result).toContain("A");
  });

  test("Two chars produce 4 combinations", () => {
    const result = op.run("ab", []);
    const lines = result.split("\n");
    expect(lines.length).toBe(4);
    expect(lines).toContain("ab");
    expect(lines).toContain("AB");
  });

  test("Includes all-lowercase variant", () => {
    const result = op.run("hi", []);
    expect(result.split("\n")).toContain("hi");
  });

  test("Includes all-uppercase variant", () => {
    const result = op.run("hi", []);
    expect(result.split("\n")).toContain("HI");
  });

  test("Empty input produces one empty line", () => {
    const result = op.run("", []);
    expect(result).toBe("");
  });
});
