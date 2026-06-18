/**
 * @fileoverview BSONSerialise.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { BSONSerialise } from "../../src/chef/operations/BSONSerialise";
import { OperationError } from "../../src/chef/errors/OperationError";

describe("BSONSerialise", () => {
  const op = new BSONSerialise();

  test("Standard JSON serialisation", () => {
    const input = '{"hello": "world"}';
    const result = op.run(input, []);
    const hex = Buffer.from(result).toString("hex");
    expect(hex).toBe("160000000268656c6c6f0006000000776f726c640000");
  });

  test("Empty input", () => {
    const result = op.run("", []);
    expect(result.byteLength).toBe(0);
  });

  test("Invalid JSON error", () => {
    const input = "{invalid}";
    expect(() => op.run(input, [])).toThrow(OperationError);
  });
});
