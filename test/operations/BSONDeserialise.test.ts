/**
 * @fileoverview BSONDeserialise.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { BSONDeserialise } from "../../src/chef/operations/BSONDeserialise";
import { hexToAB } from "../helpers";
import { OperationError } from "../../src/chef/errors/OperationError";

describe("BSONDeserialise", () => {
  const op = new BSONDeserialise();

  test("Standard BSON deserialisation", () => {
    // {"hello": "world"}
    const input = hexToAB("160000000268656c6c6f0006000000776f726c640000");
    const result = op.run(input, []);
    const parsed = JSON.parse(result);
    expect(parsed).toEqual({ hello: "world" });
  });

  test("Empty input", () => {
    expect(op.run(new ArrayBuffer(0), [])).toBe("");
  });

  test("Invalid BSON error", () => {
    const input = hexToAB("12345678");
    expect(() => op.run(input, [])).toThrow(OperationError);
  });
});
