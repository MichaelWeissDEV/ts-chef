import { JSONBeautify } from "../../src/chef/operations/JSONBeautify";

describe("JSONBeautify", () => {
  const op = new JSONBeautify();

  test("Beautifies minified JSON", () => {
    const result = op.run('{"a":1,"b":2}', ["    "]);
    expect(result).toContain("\n");
    expect(result).toContain("    ");
  });

  test("Result is valid JSON", () => {
    const result = op.run('{"key":"value"}', ["    "]);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  test("Arrays are beautified", () => {
    const result = op.run("[1,2,3]", ["    "]);
    expect(result).toContain("\n");
  });

  test("Empty object stays valid", () => {
    const result = op.run("{}", ["    "]);
    expect(JSON.parse(result)).toEqual({});
  });

  test("Nested JSON is properly indented", () => {
    const result = op.run('{"a":{"b":1}}', ["  "]);
    expect(result).toContain("  ");
  });
});
