import { SetUnion } from "../../src/chef/operations/SetUnion";

describe("SetUnion", () => {
  const op = new SetUnion();

  test("Union of two sets", () => {
    const result = op.run("a,b\n\nc,d", ["\n\n", ","]);
    expect(result).toContain("a");
    expect(result).toContain("b");
    expect(result).toContain("c");
    expect(result).toContain("d");
  });

  test("Union with overlapping elements has no duplicates", () => {
    const result = op.run("a,b,c\n\nb,c,d", ["\n\n", ","]);
    const items = result.split(",");
    expect(items.filter((x) => x === "b").length).toBe(1);
  });

  test("Union of identical sets equals that set", () => {
    const result = op.run("a,b\n\na,b", ["\n\n", ","]);
    const items = result.split(",");
    expect(items.filter((x) => x === "a").length).toBe(1);
  });

  test("Union with empty second set equals first set", () => {
    const result = op.run("a,b\n\n", ["\n\n", ","]);
    expect(result).toContain("a");
    expect(result).toContain("b");
  });

  test("Less than two sets throws error", () => {
    expect(() => op.run("a,b,c", ["\n\n", ","])).toThrow();
  });
});
