/**
 * @fileoverview ToMorseCode.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ToMorseCode } from "../../src/chef/operations/ToMorseCode";

describe("ToMorseCode", () => {
  const op = new ToMorseCode();

  test("Encodes 'SOS' to Morse code", () => {
    const result = op.run("SOS", ["Dots/Dashes", "Space", "Line feed"]);
    expect(result).toContain("...");
    expect(result).toContain("---");
  });

  test("Encodes 'A' to .-", () => {
    expect(op.run("A", ["Dots/Dashes", "Space", "Line feed"])).toBe(".-");
  });

  test("Encodes 'E' to .", () => {
    expect(op.run("E", ["Dots/Dashes", "Space", "Line feed"])).toBe(".");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", ["Dots/Dashes", "Space", "Line feed"])).toBe("");
  });

  test("Space separates letters", () => {
    const result = op.run("AB", ["Dots/Dashes", "Space", "Line feed"]);
    expect(result).toBe(".- -...");
  });
});
