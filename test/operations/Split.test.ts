import { Split } from "../../src/chef/operations/Split";

describe("Split", () => {
  const op = new Split();

  test("Splits by comma and joins with newline", () => {
    expect(op.run("a,b,c", [",", "\n"])).toBe("a\nb\nc");
  });

  test("Splits by space and joins with comma", () => {
    expect(op.run("hello world foo", [" ", ","])).toBe("hello,world,foo");
  });

  test("No match leaves string unchanged", () => {
    expect(op.run("hello", [",", "\n"])).toBe("hello");
  });

  test("Splits by newline and joins by space", () => {
    expect(op.run("a\nb\nc", ["\n", " "])).toBe("a b c");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", [",", "\n"])).toBe("");
  });
});
