import { SetDifference } from "../../src/chef/operations/SetDifference";

describe("SetDifference", () => {
  const op = new SetDifference();

  test("A minus B removes B elements from A", () => {
    const result = op.run("a,b,c\n\nb,c", ["\n\n", ","]);
    expect(result).toContain("a");
    expect(result).not.toContain("b");
    expect(result).not.toContain("c");
  });

  test("A minus empty set equals A", () => {
    const result = op.run("a,b\n\n", ["\n\n", ","]);
    expect(result).toContain("a");
    expect(result).toContain("b");
  });

  test("A minus A is empty", () => {
    const result = op.run("a,b\n\na,b", ["\n\n", ","]);
    expect(result).toBe("");
  });

  test("Empty A minus anything is empty", () => {
    const result = op.run("\n\na,b", ["\n\n", ","]);
    expect(result).toBe("");
  });

  test("Less than two sets throws error", () => {
    expect(() => op.run("a,b", ["\n\n", ","])).toThrow();
  });
});
