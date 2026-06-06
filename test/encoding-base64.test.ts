import { byteArrToStr } from "./helpers";
import { ToBase64 } from "../src/chef/operations/ToBase64";
import { FromBase64 } from "../src/chef/operations/FromBase64";

const toArgs: [string, boolean] = ["A-Za-z0-9+/=", false];
const fromArgs: [string, boolean, boolean] = ["A-Za-z0-9+/=", true, false];

const SAMPLES: [string, string][] = [
  ["hello", "aGVsbG8="],
  ["hello world", "aGVsbG8gd29ybGQ="],
  ["", ""],
  ["a", "YQ=="],
  [
    "The quick brown fox jumps over the lazy dog",
    "VGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZw==",
  ],
];

describe("Base64 known vectors", () => {
  test.each(SAMPLES)("encode %p → %p", (plain, b64) => {
    const bytes = Array.from(Buffer.from(plain, "utf-8"));
    expect(new ToBase64().run(bytes, toArgs)).toBe(b64);
  });

  test.each(SAMPLES)("decode %p → %p", (plain, b64) => {
    if (!b64) return;
    const dec = new FromBase64().run(b64, fromArgs);
    expect(byteArrToStr(dec as number[])).toBe(plain);
  });
});

describe("Base64 round-trips", () => {
  const cases = ["hello", "binary: \x00\x01\x02\xff", "unicode: abc"];
  test.each(cases)("round-trip: %p", (sample) => {
    const bytes = Array.from(Buffer.from(sample, "utf-8"));
    const enc = new ToBase64().run(bytes, toArgs);
    const dec = new FromBase64().run(enc as string, fromArgs);
    expect(byteArrToStr(dec as number[])).toBe(sample);
  });

  test("url-safe alphabet", () => {
    const bytes = Array.from(Buffer.from("hello world!", "utf-8"));
    const enc = new ToBase64().run(bytes, ["A-Za-z0-9-_", false]);
    const dec = new FromBase64().run(enc as string, [
      "A-Za-z0-9-_",
      true,
      false,
    ]);
    expect(byteArrToStr(dec as number[])).toBe("hello world!");
  });

  test("decode known: SGVsbG8gV29ybGQ=", () => {
    expect(
      byteArrToStr(
        new FromBase64().run("SGVsbG8gV29ybGQ=", fromArgs) as number[],
      ),
    ).toBe("Hello World");
  });
});
