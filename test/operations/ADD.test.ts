/**
 * @fileoverview ADD.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ADD } from "../../src/chef/operations/ADD";

describe("ADD", () => {
  const op = new ADD();

  test("Standard ADD with hex key", () => {
    const input = [0x01, 0x02, 0x03];
    const key = { string: "01", option: "Hex" };
    expect(op.run(input, [key])).toEqual([0x02, 0x03, 0x04]);
  });

  test("ADD with wrapping (MOD 256)", () => {
    const input = [0xff];
    const key = { string: "01", option: "Hex" };
    expect(op.run(input, [key])).toEqual([0x00]);
  });

  test("ADD with multi-byte key", () => {
    const input = [0x01, 0x01, 0x01];
    const key = { string: "01 02", option: "Hex" };
    expect(op.run(input, [key])).toEqual([0x02, 0x03, 0x02]);
  });

  test("Empty input", () => {
    const input: number[] = [];
    const key = { string: "01", option: "Hex" };
    expect(op.run(input, [key])).toEqual([]);
  });

  test("Empty key (should not change input)", () => {
    const input = [0x01, 0x02, 0x03];
    const key = { string: "", option: "Hex" };
    expect(op.run(input, [key])).toEqual([0x01, 0x02, 0x03]);
  });
});
