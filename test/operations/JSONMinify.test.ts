import { JSONMinify } from "../../src/chef/operations/JSONMinify";

describe("JSONMinify", () => {
  const op = new JSONMinify();

  test("Minifies formatted JSON", () => {
    const input = '{\n  "a": 1,\n  "b": 2\n}';
    const result = op.run(input, []);
    expect(result).not.toContain("\n");
    expect(result).not.toContain("  ");
  });

  test("Result is valid JSON", () => {
    const input = '{\n  "key": "value"\n}';
    const result = op.run(input, []);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  test("Already minified JSON stays the same", () => {
    const input = '{"a":1}';
    expect(op.run(input, [])).toBe('{"a":1}');
  });

  test("Empty string returns empty", () => {
    expect(op.run("", [])).toBe("");
  });

  test("Array is minified", () => {
    const input = "[\n  1,\n  2,\n  3\n]";
    const result = op.run(input, []);
    expect(result).toBe("[1,2,3]");
  });
});
