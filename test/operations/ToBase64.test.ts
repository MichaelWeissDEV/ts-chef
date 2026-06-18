/**
 * @fileoverview ToBase64.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ToBase64 } from "../../src/chef/operations/ToBase64";

describe("ToBase64", () => {
  const op = new ToBase64();

  const str = (s: string) => Array.from(Buffer.from(s, "utf8"));

  test("Encodes 'hello' to base64", () => {
    expect(op.run(str("hello"), ["A-Za-z0-9+/="])).toBe("aGVsbG8=");
  });

  test("Encodes 'Man' to 'TWFu'", () => {
    expect(op.run(str("Man"), ["A-Za-z0-9+/="])).toBe("TWFu");
  });

  test("Empty input encodes to empty string", () => {
    expect(op.run([], ["A-Za-z0-9+/="])).toBe("");
  });

  test("Encodes 'hello world'", () => {
    expect(op.run(str("hello world"), ["A-Za-z0-9+/="])).toBe(
      "aGVsbG8gd29ybGQ=",
    );
  });

  test("Encodes binary data", () => {
    expect(op.run([0x00, 0x01, 0x02], ["A-Za-z0-9+/="])).toBe("AAEC");
  });
});
