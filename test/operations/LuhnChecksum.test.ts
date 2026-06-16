import { LuhnChecksum } from "../../src/chef/operations/LuhnChecksum";

describe("LuhnChecksum", () => {
  const op = new LuhnChecksum();

  test("Returns checksum info for a valid credit card number", () => {
    const result = op.run("4532015112830366", [10]);
    expect(result).toContain("Checksum:");
    expect(result).toContain("Checkdigit:");
    expect(result).toContain("Luhn Validated String:");
  });

  test("Empty input returns empty string", () => {
    expect(op.run("", [10])).toBe("");
  });

  test("Single digit input", () => {
    const result = op.run("1", [10]);
    expect(result).toContain("Luhn Validated String:");
  });

  test("Result contains checkdigit appended to input", () => {
    const result = op.run("123", [10]);
    const match = result.match(/Luhn Validated String: (\d+)/);
    expect(match).not.toBeNull();
    expect(match![1].startsWith("123")).toBe(true);
  });

  test("Invalid radix throws error", () => {
    expect(() => op.run("123", [3])).toThrow();
  });
});
