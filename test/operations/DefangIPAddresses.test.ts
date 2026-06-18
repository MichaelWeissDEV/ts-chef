/**
 * @fileoverview DefangIPAddresses.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { DefangIPAddresses } from "../../src/chef/operations/DefangIPAddresses";

describe("DefangIPAddresses", () => {
  const op = new DefangIPAddresses();

  test("Defangs IPv4 address dots", () => {
    expect(op.run("192.168.1.1", [])).toBe("192[.]168[.]1[.]1");
  });

  test("Defangs multiple IPv4 addresses in text", () => {
    const result = op.run("IP: 10.0.0.1 and 172.16.0.1", []);
    expect(result).toContain("10[.]0[.]0[.]1");
    expect(result).toContain("172[.]16[.]0[.]1");
  });

  test("Non-IP text is unchanged", () => {
    expect(op.run("hello world", [])).toBe("hello world");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", [])).toBe("");
  });

  test("Defangs IPv6 colons", () => {
    const result = op.run("2001:db8::1", []);
    expect(result).toContain("[:]");
  });
});
