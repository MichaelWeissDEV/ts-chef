import {
  analyseIntegerLiteral,
  findIntegerLiteralAt,
  formatIntegerLiteral,
} from "../src/providers/integerLiteral";

describe("integer literal analysis", () => {
  test.each([
    ["0xff", 255n, 16],
    ["0b1111_0000", 240n, 2],
    ["0o755", 493n, 8],
    ["1_000_000", 1_000_000n, 10],
    ["-42i16", -42n, 10],
    ["0xDEAD_BEEFu32", 0xdeadbeefn, 16],
    ["123ULL", 123n, 10],
    ["9007199254740993n", 9_007_199_254_740_993n, 10],
  ])("parses %s", (literal, value, radix) => {
    const result = analyseIntegerLiteral(literal);
    expect(result?.value).toBe(value);
    expect(result?.radix).toBe(radix);
  });

  test("shows signed and unsigned two's-complement interpretations", () => {
    const minusOne = analyseIntegerLiteral("-1i8");
    expect(minusOne).toMatchObject({
      bitWidth: 8,
      twosComplementHex: "0xff",
      twosComplementBinary: "1111_1111",
      unsignedAtWidth: 255n,
      signedAtWidth: -1n,
    });

    const highBit = analyseIntegerLiteral("0xffu8");
    expect(highBit?.signedAtWidth).toBe(-1n);
  });

  test("rejects floats and identifier fragments", () => {
    expect(findIntegerLiteralAt("value = 3.1415", 9)).toBeUndefined();
    expect(findIntegerLiteralAt("sha256value", 5)).toBeUndefined();
  });

  test("locates signed literals at the cursor", () => {
    const found = findIntegerLiteralAt("let mask = -0x80i16;", 14);
    expect(found?.analysis.value).toBe(-128n);
    expect(found?.start).toBe(11);
    expect(found?.end).toBe(19);
  });

  test("formats replacements using language-appropriate octal syntax", () => {
    const value = analyseIntegerLiteral("255u32")!;
    expect(formatIntegerLiteral(value, "hex", "rust")).toBe("0xffu32");
    expect(formatIntegerLiteral(value, "binary", "rust")).toBe("0b11111111u32");
    expect(formatIntegerLiteral(value, "octal", "python")).toBe("0o377u32");
    expect(formatIntegerLiteral(value, "octal", "cpp")).toBe("0377u32");
    expect(formatIntegerLiteral(value, "decimal", "rust")).toBe("255u32");
  });

  test("understands legacy C-family octal and integer-width suffixes", () => {
    expect(analyseIntegerLiteral("0755", "cpp")?.value).toBe(493n);
    expect(analyseIntegerLiteral("0755", "go")?.value).toBe(493n);
    expect(analyseIntegerLiteral("0755", "python")?.value).toBe(755n);
    expect(analyseIntegerLiteral("1U", "cpp")?.bitWidth).toBe(32);
  });

  test("reports values that overflow an explicit type width", () => {
    expect(analyseIntegerLiteral("256u8")?.fitsWidth).toBe(false);
    expect(analyseIntegerLiteral("-129i8")?.warning).toContain("signed 8-bit");
    expect(analyseIntegerLiteral("255u8")?.fitsWidth).toBe(true);
  });

  test("does not consume a binary minus as part of the following literal", () => {
    const found = findIntegerLiteralAt("1-2", 2);
    expect(found?.analysis.value).toBe(2n);
    expect(found?.start).toBe(2);
  });
});
