/**
 * @fileoverview FromBase64.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { FromBase64 } from "../../src/chef/operations/FromBase64";

describe("FromBase64", () => {
  const op = new FromBase64();

  const out = (arr: number[]) => Buffer.from(arr).toString("utf8");

  test("Decodes 'aGVsbG8=' to 'hello'", () => {
    expect(out(op.run("aGVsbG8=", ["A-Za-z0-9+/=", true, false]))).toBe(
      "hello",
    );
  });

  test("Decodes 'TWFu' to 'Man'", () => {
    expect(out(op.run("TWFu", ["A-Za-z0-9+/=", true, false]))).toBe("Man");
  });

  test("Empty input returns empty array", () => {
    expect(op.run("", ["A-Za-z0-9+/=", true, false])).toEqual([]);
  });

  test("Decodes 'aGVsbG8gd29ybGQ=' to 'hello world'", () => {
    expect(out(op.run("aGVsbG8gd29ybGQ=", ["A-Za-z0-9+/=", true, false]))).toBe(
      "hello world",
    );
  });

  test("Decodes binary data 'AAEC'", () => {
    expect(op.run("AAEC", ["A-Za-z0-9+/=", true, false])).toEqual([
      0x00, 0x01, 0x02,
    ]);
  });
});
