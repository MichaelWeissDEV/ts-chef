import { FromDecimal } from "../../src/chef/operations/FromDecimal";

describe("FromDecimal", () => {
  const op = new FromDecimal();

  const out = (arr: number[]) => Buffer.from(arr).toString("utf8");

  test("Converts decimal 65 to 'A'", () => {
    expect(out(op.run("65", ["Space", false]))).toBe("A");
  });

  test("Converts space-separated decimals to 'hi'", () => {
    expect(out(op.run("104 105", ["Space", false]))).toBe("hi");
  });

  test("Comma-delimited decimals", () => {
    expect(out(op.run("65,66,67", ["Comma", false]))).toBe("ABC");
  });

  test("Empty input returns empty array", () => {
    expect(op.run("", ["Space", false])).toEqual([]);
  });

  test("Converts 0 to null byte", () => {
    expect(op.run("0", ["Space", false])).toEqual([0]);
  });
});
