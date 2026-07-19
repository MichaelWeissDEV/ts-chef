/**
 * @fileoverview Byte-preserving Base62 operation tests.
 * @package test/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import { FromBase62 } from "../../src/chef/operations/FromBase62";
import { BASE62_ALPHABET, ToBase62 } from "../../src/chef/operations/ToBase62";

function toArrayBuffer(bytes: number[]): ArrayBuffer {
  return Uint8Array.from(bytes).buffer;
}

describe("Base62 operations", () => {
  const encoder = new ToBase62();
  const decoder = new FromBase62();
  const encode = (bytes: number[], alphabet = BASE62_ALPHABET) =>
    encoder.run(toArrayBuffer(bytes), [alphabet]);
  const decode = (value: string, alphabet = BASE62_ALPHABET) =>
    decoder.run(value, [alphabet]);

  test.each([
    [[]],
    [[0]],
    [[0, 0]],
    [[0, 1, 2]],
    [[1, 0, 255]],
    [[255, 254, 253, 0]],
  ] as Array<[number[]]>)(
    "round-trips every byte including leading zeros: %p",
    (bytes) => {
      expect(decode(encode(bytes))).toEqual(bytes);
    },
  );

  test.each([
    [[], ""],
    [[0], "0"],
    [[0, 0], "00"],
    [[0, 1], "01"],
    [[255], "47"],
  ] as Array<[number[], string]>)(
    "encodes zero prefixes and numeric values exactly: %p",
    (bytes, encoded) => {
      expect(encode(bytes)).toBe(encoded);
      expect(decode(encoded)).toEqual(bytes);
    },
  );

  test("supports expanded alphabet ranges", () => {
    const range = "0-9A-Za-z";
    const bytes = [0, 1, 2, 3, 255];
    expect(decode(encode(bytes, range), range)).toEqual(bytes);
  });

  test("rejects characters outside the selected alphabet", () => {
    expect(() => decode("abc!", BASE62_ALPHABET)).toThrow(
      "Invalid Base62 character",
    );
  });

  test.each(["x", "001"])("rejects an invalid alphabet: %p", (alphabet) => {
    expect(() => encode([1], alphabet)).toThrow("at least 2 unique characters");
    expect(() => decode("0", alphabet)).toThrow("at least 2 unique characters");
  });
});
