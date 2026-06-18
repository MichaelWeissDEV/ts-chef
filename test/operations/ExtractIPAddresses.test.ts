/**
 * @fileoverview ExtractIPAddresses.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ExtractIPAddresses } from "../../src/chef/operations/ExtractIPAddresses";

describe("ExtractIPAddresses", () => {
  const op = new ExtractIPAddresses();

  test("Extracts single IPv4 address", () => {
    const result = op.run("Server at 192.168.1.1", [
      true,
      false,
      false,
      false,
      false,
      false,
    ]);
    expect(result).toContain("192.168.1.1");
  });

  test("Extracts multiple IPv4 addresses", () => {
    const result = op.run("10.0.0.1 and 172.16.0.2", [
      true,
      false,
      false,
      false,
      false,
      false,
    ]);
    expect(result).toContain("10.0.0.1");
    expect(result).toContain("172.16.0.2");
  });

  test("No IPs in input returns empty", () => {
    expect(
      op.run("hello world", [true, false, false, false, false, false]),
    ).toBe("");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", [true, false, false, false, false, false])).toBe("");
  });

  test("Extracts IPv6 when enabled", () => {
    const result = op.run("IPv6: 2001:db8::1 here", [
      false,
      true,
      false,
      false,
      false,
      false,
    ]);
    expect(result).toContain("2001:db8::1");
  });
});
