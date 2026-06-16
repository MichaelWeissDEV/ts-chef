import { FromBase64 } from "../../src/chef/operations/FromBase64";

describe("FromBase64", () => {
  const op = new FromBase64();

  const out = (arr: number[]) => Buffer.from(arr).toString("utf8");

  test("Decodes 'aGVsbG8=' to 'hello'", () => {
    expect(out(op.run("aGVsbG8=", ["A-Za-z0-9+/=", true, false]))).toBe(
      "hello",
    );
  });

  test("Decodes 'TWFu' to 'Man'", () => {
    expect(out(op.run("TWFu", ["A-Za-z0-9+/=", true, false]))).toBe("Man");
  });

  test("Empty input returns empty array", () => {
    expect(op.run("", ["A-Za-z0-9+/=", true, false])).toEqual([]);
  });

  test("Decodes 'aGVsbG8gd29ybGQ=' to 'hello world'", () => {
    expect(out(op.run("aGVsbG8gd29ybGQ=", ["A-Za-z0-9+/=", true, false]))).toBe(
      "hello world",
    );
  });

  test("Decodes binary data 'AAEC'", () => {
    expect(op.run("AAEC", ["A-Za-z0-9+/=", true, false])).toEqual([
      0x00, 0x01, 0x02,
    ]);
  });
});
