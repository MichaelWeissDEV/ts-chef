/**
 * @fileoverview detector.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { analyseValue, scanString } from "../src/providers/detector";

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

  test("detects Base64 immediately after an assignment delimiter", () => {
    const encoded = "SGVsbG8gV29ybGQhISEh";
    const match = scanString(`PAYLOAD=${encoded}`).find((entry) =>
      entry.matches.some((candidate) => candidate.label === "Base64"),
    );
    expect(match?.value).toBe(encoded);
    expect(match?.start).toBe("PAYLOAD=".length);
  });

  test("does not begin a new Base64 token inside double padding", () => {
    const encoded = "SGVsbG8gV29ybGQhISEh";
    const match = scanString(`AAAA==${encoded}`).find(
      (entry) =>
        entry.start === "AAAA==".length &&
        entry.matches.some((candidate) => candidate.label === "Base64"),
    );
    expect(match).toBeUndefined();
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

  test("ranks exact hash signatures above generic hexadecimal data", () => {
    const results = analyseValue("d41d8cd98f00b204e9800998ecf8427e");
    expect(results[0]?.label).toBe("MD5 hash");
  });

  test("does not flag a normal long source-code identifier as Base64", () => {
    expect(labels("authenticationConfigurationValue")).not.toContain("Base64");
  });

  test("keeps a data URI wrapper as the replacement range and its payload as input", () => {
    const uri = "data:text/plain;base64,SGVsbG8gd29ybGQ=";
    const match = scanString(uri).find((entry) =>
      entry.matches.some((item) => item.label === "Data URI (Base64)"),
    );
    expect(match?.value).toBe(uri);
    expect(
      match?.matches.find((item) => item.label === "Data URI (Base64)")
        ?.inputValue,
    ).toBe("SGVsbG8gd29ybGQ=");
  });

  test("scans long non-URL payloads without catastrophic URL-regex backtracking", () => {
    const payload = "A".repeat(65_536);
    const started = Date.now();
    scanString(payload);
    expect(Date.now() - started).toBeLessThan(250);
  });

  test("skips the URL regex in linear time when only one escape is present", () => {
    const payload = `${"A".repeat(65_536)}%41`;
    const started = Date.now();
    const detected = scanString(payload).flatMap((match) =>
      match.matches.map((candidate) => candidate.label),
    );
    expect(detected).not.toContain("URL encoded");
    expect(Date.now() - started).toBeLessThan(250);
  });
});
