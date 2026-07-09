/**
 * @fileoverview format.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import {
  detectFormat,
  makeReadable,
  chunk,
  softWrap,
} from "../src/providers/format";

describe("detectFormat", () => {
  test("recognises JSON objects", () => {
    const c = detectFormat('{"a":1,"b":[2,3]}');
    expect(c?.opName).toBe("JSONBeautify");
    expect(c?.languageId).toBe("json");
  });

  test("does not treat invalid JSON as JSON", () => {
    expect(detectFormat("{not valid json")).toBeNull();
  });

  test("recognises XML", () => {
    expect(detectFormat("<root><child>x</child></root>")?.opName).toBe(
      "XMLBeautify",
    );
  });

  test("recognises SQL statements", () => {
    expect(detectFormat("select * from users where id = 1")?.opName).toBe(
      "SQLBeautify",
    );
  });

  test("recognises CSS", () => {
    expect(detectFormat(".btn { color: red; padding: 4px; }")?.opName).toBe(
      "CSSBeautify",
    );
  });

  test("returns null for plain prose", () => {
    expect(detectFormat("just an ordinary sentence")).toBeNull();
  });
});

describe("chunk", () => {
  test("splits into fixed-width rows", () => {
    expect(chunk("aaaabbbbcc", 4)).toBe("aaaa\nbbbb\ncc");
  });
});

describe("softWrap", () => {
  test("wraps on whitespace near the target width", () => {
    const line = "word ".repeat(40).trim();
    const out = softWrap(line, 20);
    expect(out).toContain("\n");
    for (const l of out.split("\n")) expect(l.length).toBeLessThanOrEqual(24);
  });

  test("hard-splits a single over-long token", () => {
    const out = softWrap("x".repeat(50), 20);
    expect(out.split("\n").length).toBeGreaterThan(1);
  });
});

describe("makeReadable", () => {
  test("leaves already-short content unchanged", () => {
    const text = "line one\nline two\nline three";
    expect(makeReadable(text, 100)).toBe(text);
  });

  test("wraps a long continuous hex blob into rows", () => {
    const hex = "ab".repeat(200); // 400 chars
    const out = makeReadable(hex, 100);
    expect(out).toContain("\n");
    expect(out.replace(/\n/g, "")).toBe(hex); // data preserved
  });

  test("splits a long delimiter-heavy line into entries", () => {
    const line = Array.from({ length: 10 }, (_, i) => `key${i}=value${i}`).join(
      ";",
    );
    const padded = line + ";" + "x".repeat(200);
    const out = makeReadable(padded, 100);
    expect(out.split("\n").length).toBeGreaterThan(1);
  });

  test("does not lose characters when reflowing", () => {
    const blob = "token_" + "abcdEFGH1234".repeat(30);
    const out = makeReadable(blob, 80);
    expect(out.replace(/\n/g, "")).toBe(blob);
  });
});
