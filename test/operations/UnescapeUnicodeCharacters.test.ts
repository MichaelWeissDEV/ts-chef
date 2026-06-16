import { UnescapeUnicodeCharacters } from "../../src/chef/operations/UnescapeUnicodeCharacters";

describe("UnescapeUnicodeCharacters", () => {
  const op = new UnescapeUnicodeCharacters();

  test("Unescapes %u00e9 to é", () => {
    expect(op.run("%u00e9", ["%u"])).toBe("é");
  });

  test("Unescapes %u0041 to A", () => {
    expect(op.run("%u0041", ["%u"])).toBe("A");
  });

  test("Unescapes U+0041 to A with U+ prefix", () => {
    expect(op.run("U+0041", ["U+"])).toBe("A");
  });

  test("Mixed text with %u escape sequence", () => {
    expect(op.run("caf%u00e9", ["%u"])).toBe("café");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", ["%u"])).toBe("");
  });
});
