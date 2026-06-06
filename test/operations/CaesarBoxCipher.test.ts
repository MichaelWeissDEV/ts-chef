import { CaesarBoxCipher } from "../../src/chef/operations/CaesarBoxCipher";

describe("CaesarBoxCipher", () => {
  const op = new CaesarBoxCipher();

  test("Standard encoding (Height 2)", () => {
    // "HELLO" with height 2
    // H E L
    // L O \0
    // Result: H L E O L
    const input = "HELLO";
    expect(op.run(input, [2])).toBe("HLOEL");
  });

  test("Standard encoding (Height 3)", () => {
    // "CYBERCHEF" with height 3
    // C Y B
    // E R C
    // H E F
    // Result: C E H Y R E B C F
    const input = "CYBERCHEF";
    expect(op.run(input, [3])).toBe("CEHYREBCF");
  });

  test("Spaces should be removed", () => {
    const input = "H E L L O";
    expect(op.run(input, [2])).toBe("HLOEL");
  });

  test("Encoding with padding", () => {
    const input = "HELL";
    // H E
    // L L
    // \0 \0
    // Height 3:
    // H E L L \0 \0
    // i=0: 0, 3 -> H, L
    // i=1: 1, 4 -> E, \0
    // i=2: 2, 5 -> L, \0
    // Result: HL E L
    expect(op.run(input, [3])).toBe("HLEL");
  });
});
