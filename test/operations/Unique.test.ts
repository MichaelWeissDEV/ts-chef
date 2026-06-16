import { Unique } from "../../src/chef/operations/Unique";

describe("Unique", () => {
  const op = new Unique();

  test("Removes duplicate lines", () => {
    expect(op.run("a\nb\na\nc", ["Line feed", false])).toBe("a\nb\nc");
  });

  test("No duplicates → unchanged", () => {
    expect(op.run("a\nb\nc", ["Line feed", false])).toBe("a\nb\nc");
  });

  test("All duplicates reduces to single line", () => {
    expect(op.run("x\nx\nx", ["Line feed", false])).toBe("x");
  });

  test("Comma delimiter", () => {
    expect(op.run("a,b,a,c", ["Comma", false])).toBe("a,b,c");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", ["Line feed", false])).toBe("");
  });
});
