/**
 * @fileoverview CitrixCTX1Encode.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { CitrixCTX1Encode } from "../../src/chef/operations/CitrixCTX1Encode";
import { CitrixCTX1Decode } from "../../src/chef/operations/CitrixCTX1Decode";

describe("CitrixCTX1Encode", () => {
  let encode: CitrixCTX1Encode;
  let decode: CitrixCTX1Decode;

  beforeEach(() => {
    encode = new CitrixCTX1Encode();
    decode = new CitrixCTX1Decode();
  });

  test("should encode 'password' correctly", () => {
    const input = "password";
    const encoded = encode.run(input, []);

    // Convert to string for easier comparison if needed,
    // or just check if it decodes back.
    const decoded = decode.run(new Uint8Array(encoded).buffer, []);
    expect(decoded).toBe(input);
  });

  test("should encode empty string correctly", () => {
    const input = "";
    const encoded = encode.run(input, []);
    expect(encoded).toEqual([]);

    const decoded = decode.run(new Uint8Array(encoded).buffer, []);
    expect(decoded).toBe("");
  });

  test("should encode special characters correctly", () => {
    const input = "Pass123! @#";
    const encoded = encode.run(input, []);
    const decoded = decode.run(new Uint8Array(encoded).buffer, []);
    expect(decoded).toBe(input);
  });
});
