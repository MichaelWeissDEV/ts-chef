import { FromHex } from "../../src/chef/operations/FromHex";

describe("FromHex", () => {
  const op = new FromHex();

  const out = (arr: number[]) => Buffer.from(arr).toString("utf8");

  test("Converts hex 'hello' with space delimiter", () => {
    expect(out(op.run("68 65 6c 6c 6f", ["Space"]))).toBe("hello");
  });

  test("Converts hex without delimiter", () => {
    expect(out(op.run("48656c6c6f", ["None"]))).toBe("Hello");
  });

  test("Converts single byte", () => {
    expect(op.run("41", ["None"])).toEqual([0x41]);
  });

  test("Empty input returns empty array", () => {
    expect(op.run("", ["Space"])).toEqual([]);
  });

  test("Comma-delimited hex bytes", () => {
    expect(out(op.run("41,42,43", ["Comma"]))).toBe("ABC");
  });
});
