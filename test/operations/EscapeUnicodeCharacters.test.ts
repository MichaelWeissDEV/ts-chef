import { EscapeUnicodeCharacters } from "../../src/chef/operations/EscapeUnicodeCharacters";

describe("EscapeUnicodeCharacters", () => {
  const op = new EscapeUnicodeCharacters();

  test("ASCII chars unchanged when encodeAll is false", () => {
    expect(op.run("hello", ["\\u", false, 4, false])).toBe("hello");
  });

  test("Non-ASCII char is escaped", () => {
    expect(op.run("café", ["\\u", false, 4, false])).toContain("\\u00e9");
  });

  test("Encodes all chars including ASCII when encodeAll is true", () => {
    const result = op.run("A", ["\\u", true, 4, false]);
    expect(result).toContain("\\u0041");
  });

  test("Uses U+ prefix when specified", () => {
    const result = op.run("é", ["U+", false, 4, false]);
    expect(result).toContain("U+");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", ["\\u", false, 4, false])).toBe("");
  });
});
