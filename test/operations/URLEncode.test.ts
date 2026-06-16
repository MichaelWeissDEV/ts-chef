import { URLEncode } from "../../src/chef/operations/URLEncode";

describe("URLEncode", () => {
  const op = new URLEncode();

  test("Encodes spaces as +", () => {
    expect(op.run("hello world", [false])).toBe("hello+world");
  });

  test("Encodes reserved chars when encodeAll is true", () => {
    const result = op.run("a+b=c", [true]);
    expect(result).toContain("%2B");
    expect(result).toContain("%3D");
  });

  test("Plain alphanumeric is unchanged without encodeAll", () => {
    expect(op.run("hello123", [false])).toBe("hello123");
  });

  test("Empty input", () => {
    expect(op.run("", [false])).toBe("");
  });

  test("Ampersand and question mark are encoded", () => {
    const result = op.run("?q=test&lang=de", [false]);
    expect(result).toContain("%3F");
    expect(result).toContain("%3D");
    expect(result).toContain("%26");
  });
});
