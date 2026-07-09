/**
 * @fileoverview detector.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { analyseValue } from "../src/providers/detector";

function labels(value: string): string[] {
  return analyseValue(value).map((r) => r.label);
}

describe("analyseValue", () => {
  test("detects standard Base64", () => {
    const encoded = Buffer.from(
      "Hello from the ts-chef detector test!",
      "utf-8",
    ).toString("base64");
    expect(labels(encoded)).toContain("Base64");
  });

  test("detects JWTs with high confidence first", () => {
    const jwt =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
      "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0." +
      "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJVadQssw5c";
    const results = analyseValue(jwt);
    expect(results[0]?.label).toBe("JWT");
  });

  test("detects UUIDs", () => {
    expect(labels("6ba7b810-9dad-11d1-80b4-00c04fd430c8")).toContain("UUID");
  });

  test("detects hex strings", () => {
    expect(labels("48656c6c6f20776f726c642121")).toContain("Hex string");
  });

  test("detects bcrypt hashes", () => {
    const hash = "$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW";
    expect(labels(hash)).toContain("bcrypt hash");
  });

  test("detects the Base64 payload of a data URI", () => {
    const payload = Buffer.from(
      "A reasonably long payload so the ratio check passes.",
      "utf-8",
    ).toString("base64");
    expect(labels(`data:application/octet-stream;base64,${payload}`)).toContain(
      "Data URI (Base64)",
    );
  });

  test("detects \\x-escaped hex bytes", () => {
    expect(labels("\\x48\\x65\\x6c\\x6c\\x6f")).toContain("Hex (\\x-escaped)");
  });

  test("detects URL-encoded strings", () => {
    expect(labels("Hello%20world%21%20This%20is%20a%20test")).toContain(
      "URL encoded",
    );
  });

  test("returns nothing for plain prose", () => {
    expect(analyseValue("just a plain short sentence")).toEqual([]);
  });

  test("ranks results by confidence descending", () => {
    const results = analyseValue(
      "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    );
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].confidence).toBeGreaterThanOrEqual(
        results[i].confidence,
      );
    }
  });
});
