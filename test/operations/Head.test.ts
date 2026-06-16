import { Head } from "../../src/chef/operations/Head";

describe("Head", () => {
  const op = new Head();

  test("Returns first N lines", () => {
    expect(op.run("a\nb\nc\nd", ["Line feed", 2])).toBe("a\nb");
  });

  test("Returns all lines when N >= total", () => {
    expect(op.run("a\nb", ["Line feed", 10])).toBe("a\nb");
  });

  test("N=1 returns first line only", () => {
    expect(op.run("first\nsecond\nthird", ["Line feed", 1])).toBe("first");
  });

  test("Negative N excludes last N lines", () => {
    const result = op.run("a\nb\nc\nd", ["Line feed", -1]);
    expect(result).toBe("a\nb\nc");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", ["Line feed", 5])).toBe("");
  });
});
