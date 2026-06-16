import { HammingDistance } from "../../src/chef/operations/HammingDistance";

describe("HammingDistance", () => {
  const op = new HammingDistance();

  test("Identical strings have distance 0", () => {
    expect(op.run("abc\n\nabc", ["\n\n", "Byte", "Raw string"])).toBe("0");
  });

  test("'karolin' vs 'kathrin' has byte distance 3", () => {
    expect(op.run("karolin\n\nkathrin", ["\n\n", "Byte", "Raw string"])).toBe(
      "3",
    );
  });

  test("'1011101' vs '1001001' has byte distance 2", () => {
    expect(op.run("1011101\n\n1001001", ["\n\n", "Byte", "Raw string"])).toBe(
      "2",
    );
  });

  test("Empty strings have distance 0", () => {
    expect(op.run("\n\n", ["\n\n", "Byte", "Raw string"])).toBe("0");
  });

  test("Different length strings throw error", () => {
    expect(() => op.run("abc\n\nab", ["\n\n", "Byte", "Raw string"])).toThrow();
  });
});
