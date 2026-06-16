import { FromCharcode } from "../../src/chef/operations/FromCharcode";

describe("FromCharcode", () => {
  const op = new FromCharcode();

  const out = (ab: ArrayBuffer) => Buffer.from(new Uint8Array(ab)).toString("utf8");

  test("Converts hex charcode 41 to 'A'", () => {
    expect(out(op.run("41", ["Space", 16]))).toBe("A");
  });

  test("Converts space-separated hex charcodes to 'hello'", () => {
    expect(out(op.run("68 65 6c 6c 6f", ["Space", 16]))).toBe("hello");
  });

  test("Converts decimal charcode 65 to 'A' (base 10)", () => {
    expect(out(op.run("65", ["Space", 10]))).toBe("A");
  });

  test("Empty input returns empty buffer", () => {
    expect(op.run("", ["Space", 16]).byteLength).toBe(0);
  });

  test("Comma-delimited charcodes", () => {
    expect(out(op.run("41,42,43", ["Comma", 16]))).toBe("ABC");
  });
});
