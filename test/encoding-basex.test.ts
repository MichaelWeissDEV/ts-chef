/**
 * Round-trip tests for Base32/45/58/62/85/92.
 */
import { strToAB, byteArrToStr } from "./helpers";
import { ToBase32 } from "../src/chef/operations/ToBase32";
import { FromBase32 } from "../src/chef/operations/FromBase32";
import { ToBase45 } from "../src/chef/operations/ToBase45";
import { FromBase45 } from "../src/chef/operations/FromBase45";
import { ToBase58 } from "../src/chef/operations/ToBase58";
import { FromBase58 } from "../src/chef/operations/FromBase58";
import { ToBase62 } from "../src/chef/operations/ToBase62";
import { FromBase62 } from "../src/chef/operations/FromBase62";
import { ToBase85 } from "../src/chef/operations/ToBase85";
import { FromBase85 } from "../src/chef/operations/FromBase85";
import { ToBase92 } from "../src/chef/operations/ToBase92";
import { FromBase92 } from "../src/chef/operations/FromBase92";

const SAMPLES = ["hello", "hello world", "a", "abc", "0123456789"];

function abEncodeDecode(
  ToOp: any,
  FromOp: any,
  toArgs: any[],
  fromArgs: any[],
  sample: string,
) {
  const enc = new ToOp().run(strToAB(sample), toArgs);
  expect(typeof enc).toBe("string");
  expect(enc).not.toContain("undefined");
  const dec = new FromOp().run(enc, fromArgs);
  return byteArrToStr(dec as number[]);
}

function byteEncodeDecode(
  ToOp: any,
  FromOp: any,
  toArgs: any[],
  fromArgs: any[],
  sample: string,
) {
  const ab = strToAB(sample);
  const enc = new ToOp().run(ab, toArgs);
  expect(typeof enc).toBe("string");
  expect(enc).not.toContain("undefined");
  const dec = new FromOp().run(enc, fromArgs);
  return byteArrToStr(dec as number[]);
}

// ── Base32 ────────────────────────────────────────────────────────────────────
describe("Base32 round-trips", () => {
  test.each(SAMPLES)("%p", (s) => {
    expect(
      abEncodeDecode(
        ToBase32,
        FromBase32,
        ["A-Z2-7=", true],
        ["A-Z2-7=", true],
        s,
      ),
    ).toBe(s);
  });
  test("output is valid Base32 charset", () => {
    const enc = new ToBase32().run(strToAB("hello"), ["A-Z2-7=", true]);
    expect(enc).toMatch(/^[A-Z2-7=]+$/);
  });
});

// ── Base45 ────────────────────────────────────────────────────────────────────
describe("Base45 round-trips", () => {
  test.each(SAMPLES)("%p", (s) => {
    expect(abEncodeDecode(ToBase45, FromBase45, [], [], s)).toBe(s);
  });
});

// ── Base58 ────────────────────────────────────────────────────────────────────
describe("Base58 round-trips", () => {
  test.each(SAMPLES)("Bitcoin: %p", (s) => {
    expect(
      byteEncodeDecode(ToBase58, FromBase58, ["Bitcoin"], ["Bitcoin"], s),
    ).toBe(s);
  });
  test("Ripple alphabet", () => {
    expect(
      byteEncodeDecode(ToBase58, FromBase58, ["Ripple"], ["Ripple"], "hello"),
    ).toBe("hello");
  });
  test("output is alphanumeric without 0OIl", () => {
    const enc = new ToBase58().run(strToAB("hello"), ["Bitcoin"]);
    expect(enc).toMatch(
      /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/,
    );
  });
});

// ── Base62 ────────────────────────────────────────────────────────────────────
describe("Base62 round-trips", () => {
  test.each(SAMPLES)("%p", (s) => {
    expect(byteEncodeDecode(ToBase62, FromBase62, [], [], s)).toBe(s);
  });
  test("output is alphanumeric only", () => {
    const enc = new ToBase62().run(strToAB("hello"), []);
    expect(enc).toMatch(/^[A-Za-z0-9]+$/);
  });
});

// ── Base85 ────────────────────────────────────────────────────────────────────
describe("Base85 round-trips", () => {
  test.each(["ASCII85", "RFC 1924", "Z85"])("alphabet %s: hello", (alph) => {
    const enc = new ToBase85().run(strToAB("hello"), [alph, false]);
    const dec = new FromBase85().run(enc as string, [alph, false]);
    expect(byteArrToStr(dec as number[])).toBe("hello");
  });
  test("ASCII85 longer string", () => {
    const s = "The quick brown fox";
    const enc = new ToBase85().run(strToAB(s), ["ASCII85", false]);
    expect(
      byteArrToStr(
        new FromBase85().run(enc as string, ["ASCII85", false]) as number[],
      ),
    ).toBe(s);
  });
  test("ASCII85 delimiters", () => {
    const enc = new ToBase85().run(strToAB("hello"), ["ASCII85", true]);
    expect(enc).toMatch(/^<~.*~>$/);
    expect(
      byteArrToStr(
        new FromBase85().run(enc as string, ["ASCII85", true]) as number[],
      ),
    ).toBe("hello");
  });
});

// ── Base92 ────────────────────────────────────────────────────────────────────
describe("Base92 round-trips", () => {
  const BASE92_SAMPLES = [
    ...SAMPLES,
    "The quick brown fox jumps over the lazy dog",
  ];

  test.each(BASE92_SAMPLES)("%p", (s) => {
    const enc = new ToBase92().run(strToAB(s), []);
    expect(enc).not.toContain("undefined");
    expect(
      byteArrToStr(new FromBase92().run(enc as string, []) as number[]),
    ).toBe(s);
  });

  test("empty string", () => {
    expect(new ToBase92().run(strToAB(""), [])).toBe("");
    expect(byteArrToStr(new FromBase92().run("", []) as number[])).toBe("");
  });

  test("no undefined in long output", () => {
    const enc = new ToBase92().run(strToAB("A".repeat(100)), []);
    expect(enc).not.toContain("undefined");
    expect((enc as string).length).toBeGreaterThan(0);
  });
});
