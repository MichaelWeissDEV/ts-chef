import { ConvertToNATOAlphabet } from "../../src/chef/operations/ConvertToNATOAlphabet";

describe("ConvertToNATOAlphabet", () => {
  const op = new ConvertToNATOAlphabet();

  test("Basic conversion", () => {
    expect(op.run("abc", [])).toBe("Alfa Bravo Charlie ");
  });

  test("Numbers and symbols", () => {
    expect(op.run("1,.", [])).toBe("One Comma Full stop ");
  });
});
