import { FromBinary } from "../../src/chef/operations/FromBinary";

describe("FromBinary", () => {
  const op = new FromBinary();

  const out = (arr: number[]) => Buffer.from(arr).toString("utf8");

  test("Decodes binary to 'A'", () => {
    expect(out(op.run("01000001", ["Space", 8]))).toBe("A");
  });

  test("Decodes space-separated binary to 'hi'", () => {
    expect(out(op.run("01101000 01101001", ["Space", 8]))).toBe("hi");
  });

  test("Decodes binary for 'abc'", () => {
    expect(out(op.run("01100001 01100010 01100011", ["Space", 8]))).toBe("abc");
  });

  test("Empty input returns empty array", () => {
    expect(op.run("", ["Space", 8])).toEqual([]);
  });

  test("No-delimiter binary string", () => {
    expect(out(op.run("0100000101000010", ["None", 8]))).toBe("AB");
  });
});
