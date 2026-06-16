import { UnescapeString } from "../../src/chef/operations/UnescapeString";

describe("UnescapeString", () => {
  const op = new UnescapeString();

  test("Unescapes newline", () => {
    expect(op.run("hello\\nworld", [])).toBe("hello\nworld");
  });

  test("Unescapes tab", () => {
    expect(op.run("hello\\tworld", [])).toBe("hello\tworld");
  });

  test("Unescapes hex escape sequences", () => {
    expect(op.run("\\x41\\x42\\x43", [])).toBe("ABC");
  });

  test("Unescapes unicode escape sequences", () => {
    expect(op.run("\\u0041", [])).toBe("A");
  });

  test("Empty input", () => {
    expect(op.run("", [])).toBe("");
  });
});
