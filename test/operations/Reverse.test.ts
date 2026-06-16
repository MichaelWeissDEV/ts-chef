import { Reverse } from "../../src/chef/operations/Reverse";

describe("Reverse", () => {
  const op = new Reverse();

  const str = (s: string) => s.split("").map((c) => c.charCodeAt(0));
  const out = (arr: number[]) =>
    arr.map((c) => String.fromCharCode(c)).join("");

  test("Reverses a simple byte array", () => {
    expect(out(op.run(str("hello"), ["Character"]))).toBe("olleh");
  });

  test("Double reverse returns original", () => {
    const input = str("abcdef");
    expect(op.run(op.run(input, ["Character"]), ["Character"])).toEqual(input);
  });

  test("Single character unchanged", () => {
    expect(op.run(str("a"), ["Character"])).toEqual(str("a"));
  });

  test("Empty input returns empty", () => {
    expect(op.run([], ["Character"])).toEqual([]);
  });

  test("Reverses line by line in Line mode", () => {
    const input = str("hello\nworld");
    const result = out(op.run(input, ["Line"]));
    expect(result).toBe("world\nhello");
  });
});
