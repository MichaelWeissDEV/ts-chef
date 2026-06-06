import { strToAB } from "./helpers";
import { SHA1 } from "../src/chef/operations/SHA1";
import { SHA2 } from "../src/chef/operations/SHA2";
import { SHA3 } from "../src/chef/operations/SHA3";

/** Known SHA vectors (NIST / Wikipedia) */
const sha1Vectors: [string, string][] = [
  ["", "da39a3ee5e6b4b0d3255bfef95601890afd80709"],
  ["hello", "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d"],
  [
    "The quick brown fox jumps over the lazy dog",
    "2fd4e1c67a2d28fced849ee1bb76e7391b93eb12",
  ],
];

const sha256Vectors: [string, string][] = [
  ["", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"],
  ["hello", "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"],
  [
    "The quick brown fox jumps over the lazy dog",
    "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592",
  ],
];

const sha512Vectors: [string, string][] = [
  [
    "",
    "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e",
  ],
  [
    "hello",
    "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043",
  ],
];

const sha3_256Vectors: [string, string][] = [
  ["hello", "3338be694f50c5f338814986cdf0686453a888b84f424d792af4b9202398f392"],
  ["", "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a"],
];

// ── SHA-1 ─────────────────────────────────────────────────────────────────────
describe("SHA1", () => {
  test.each(sha1Vectors)("SHA1(%p) = %p", (input, expected) => {
    const result = new SHA1().run(strToAB(input), [80]);
    expect(result).toBe(expected);
  });

  test("returns 40-char hex string", () => {
    const result = new SHA1().run(strToAB("test"), [80]);
    expect(result).toMatch(/^[0-9a-f]{40}$/);
  });
});

// ── SHA-256 ───────────────────────────────────────────────────────────────────
describe("SHA2-256", () => {
  test.each(sha256Vectors)("SHA256(%p) = %p", (input, expected) => {
    const result = new SHA2().run(strToAB(input), ["256"]);
    expect(result).toBe(expected);
  });

  test("returns 64-char hex string", () => {
    const result = new SHA2().run(strToAB("test"), ["256"]);
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  test("different inputs produce different hashes", () => {
    const h1 = new SHA2().run(strToAB("hello"), ["256"]);
    const h2 = new SHA2().run(strToAB("world"), ["256"]);
    expect(h1).not.toBe(h2);
  });
});

// ── SHA-512 ───────────────────────────────────────────────────────────────────
describe("SHA2-512", () => {
  test.each(sha512Vectors)("SHA512(%p)", (input, expected) => {
    const result = new SHA2().run(strToAB(input), ["512"]);
    expect(result).toBe(expected);
  });

  test("returns 128-char hex string", () => {
    const result = new SHA2().run(strToAB("test"), ["512"]);
    expect(result).toMatch(/^[0-9a-f]{128}$/);
  });
});

// ── SHA-3-256 ─────────────────────────────────────────────────────────────────
describe("SHA3-256", () => {
  test.each(sha3_256Vectors)("SHA3-256(%p) = %p", (input, expected) => {
    const result = new SHA3().run(strToAB(input), ["256"]);
    expect(result).toBe(expected);
  });

  test("returns 64-char hex string", () => {
    const result = new SHA3().run(strToAB("test"), ["256"]);
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });
});

// ── SHA-2 size variants ───────────────────────────────────────────────────────
describe("SHA2 size variants", () => {
  const sizes: [string, number][] = [
    ["224", 56],
    ["256", 64],
    ["384", 96],
    ["512", 128],
  ];

  test.each(sizes)("SHA2-%s produces %d-char hex", (size, length) => {
    const result = new SHA2().run(strToAB(size), [size]);
    expect((result as string).length).toBe(length);
    expect(result).toMatch(/^[0-9a-f]+$/);
  });
});
