import { Shuffle } from "../../src/chef/operations/Shuffle";

describe("Shuffle", () => {
  const op = new Shuffle();

  test("Shuffled output contains same elements", () => {
    const input = "a\nb\nc\nd\ne";
    const result = op.run(input, ["Line feed"]);
    const inputLines = input.split("\n").sort();
    const resultLines = result.split("\n").sort();
    expect(resultLines).toEqual(inputLines);
  });

  test("Single element is unchanged", () => {
    expect(op.run("only", ["Line feed"])).toBe("only");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", ["Line feed"])).toBe("");
  });

  test("Output has same number of elements", () => {
    const input = "x\ny\nz";
    const result = op.run(input, ["Line feed"]);
    expect(result.split("\n").length).toBe(3);
  });

  test("Comma-delimited shuffle retains all items", () => {
    const input = "1,2,3,4";
    const result = op.run(input, ["Comma"]);
    const items = result.split(",").sort();
    expect(items).toEqual(["1", "2", "3", "4"]);
  });
});
