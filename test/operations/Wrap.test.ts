import { Wrap } from "../../src/chef/operations/Wrap";

describe("Wrap", () => {
  const op = new Wrap();

  test("Wraps long line at specified width", () => {
    const input = "abcdefghij";
    const result = op.run(input, [5, false, "Line feed"]);
    expect(result).toBe("abcde\nfghij");
  });

  test("Short line below limit is unchanged", () => {
    const input = "hello";
    expect(op.run(input, [80, false, "Line feed"])).toBe("hello");
  });

  test("Uses CRLF as line delimiter when specified", () => {
    const input = "abcdefghij";
    const result = op.run(input, [5, false, "CRLF"]);
    expect(result).toBe("abcde\r\nfghij");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", [80, false, "Line feed"])).toBe("");
  });

  test("Line length zero returns input unchanged", () => {
    expect(op.run("hello world", [0, false, "Line feed"])).toBe("hello world");
  });
});
