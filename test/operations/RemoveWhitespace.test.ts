import { RemoveWhitespace } from "../../src/chef/operations/RemoveWhitespace";

describe("RemoveWhitespace", () => {
  const op = new RemoveWhitespace();

  test("Removes spaces", () => {
    expect(
      op.run("hello world", [true, false, false, false, false, false]),
    ).toBe("helloworld");
  });

  test("Removes line feeds", () => {
    expect(
      op.run("hello\nworld", [false, false, true, false, false, false]),
    ).toBe("helloworld");
  });

  test("Removes tabs", () => {
    expect(
      op.run("hello\tworld", [false, false, false, true, false, false]),
    ).toBe("helloworld");
  });

  test("Removes all whitespace types when all flags true", () => {
    expect(op.run("a b\tc\nd", [true, false, true, true, false, false])).toBe(
      "abcd",
    );
  });

  test("Empty input returns empty", () => {
    expect(op.run("", [true, true, true, true, true, false])).toBe("");
  });
});
