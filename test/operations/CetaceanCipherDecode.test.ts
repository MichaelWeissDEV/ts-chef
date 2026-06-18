/**
 * @fileoverview CetaceanCipherDecode.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { CetaceanCipherDecode } from "../../src/chef/operations/CetaceanCipherDecode";

describe("CetaceanCipherDecode", () => {
  const op = new CetaceanCipherDecode();

  test("Standard decoding ('hi')", () => {
    // h: 104 = 0000000001101000 => EEEEEEEEEeeEeEEE
    // i: 105 = 0000000001101001 => EEEEEEEEEeeEeEEe
    // Combined: EEEEEEEEEeeEeEEEEEEEEEEEEeeEeEEe (12 Es in the middle)
    expect(op.run("EEEEEEEEEeeEeEEEEEEEEEEEEeeEeEEe", [])).toBe("hi");
  });

  test("Decoding with space", () => {
    // ' ' is handled specially in run method:
    // binaryArray.push(...[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]);
    // That is 2^5 = 32, which is ASCII for space.
    expect(op.run("EEEEEEEEEeeEeEEE EEEEEEEEEeeEeEEe", [])).toBe("h i");
  });

  test("Empty input", () => {
    expect(op.run("", [])).toBe("");
  });
});
