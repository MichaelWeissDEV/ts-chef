/**
 * @fileoverview AMFEncode.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import "reflect-metadata";
import { AMFEncode } from "../../src/chef/operations/AMFEncode";

describe("AMFEncode", () => {
  const op = new AMFEncode();

  test("AMF3 Encode simple object", () => {
    const input = { foo: "bar" };
    const result = op.run(input, ["AMF3"]);
    expect(result).toBeDefined();
    expect(result.byteLength).toBeGreaterThan(0);
  });

  test("AMF0 Encode simple object", () => {
    const input = { foo: "bar" };
    const result = op.run(input, ["AMF0"]);
    expect(result).toBeDefined();
    expect(result.byteLength).toBeGreaterThan(0);
  });

  test("AMF3 Encode number", () => {
    const input = 123;
    const result = op.run(input, ["AMF3"]);
    expect(result).toBeDefined();
    expect(result.byteLength).toBeGreaterThan(0);
  });

  test("AMF3 Encode string", () => {
    const input = "hello";
    const result = op.run(input, ["AMF3"]);
    expect(result).toBeDefined();
    expect(result.byteLength).toBeGreaterThan(0);
  });
});
