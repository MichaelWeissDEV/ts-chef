/**
 * @fileoverview Byte-preserving Base58 operation tests.
 * @package test/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import { FromBase58 } from "../../src/chef/operations/FromBase58";
import {
  ALPHABET_BITCOIN_B58,
  ToBase58,
} from "../../src/chef/operations/ToBase58";

function toArrayBuffer(bytes: number[]): ArrayBuffer {
  return Uint8Array.from(bytes).buffer;
}

describe("Base58 operations", () => {
  const encoder = new ToBase58();
  const decoder = new FromBase58();
  const encode = (bytes: number[], alphabet = ALPHABET_BITCOIN_B58) =>
    encoder.run(toArrayBuffer(bytes), [alphabet]);
  const decode = (value: string, alphabet = ALPHABET_BITCOIN_B58) =>
    decoder.run(value, [alphabet, false]);

  test("matches the standard Bitcoin alphabet vector", () => {
    const bytes = Array.from(Buffer.from("Hello World", "utf8"));
    expect(encode(bytes)).toBe("JxF12TrwUP45BMd");
    expect(Buffer.from(decode("JxF12TrwUP45BMd")).toString("utf8")).toBe(
      "Hello World",
    );
  });

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
    [[0], "1"],
    [[0, 0], "11"],
    [[0, 1], "12"],
  ] as Array<[number[], string]>)(
    "encodes zero prefixes without an extra digit: %p",
    (bytes, encoded) => {
      expect(encode(bytes)).toBe(encoded);
      expect(decode(encoded)).toEqual(bytes);
    },
  );

  test("supports the named Ripple alphabet", () => {
    const encoded = encoder.run(toArrayBuffer([0, 1, 2, 3, 255]), ["Ripple"]);
    expect(decoder.run(encoded, ["Ripple", false])).toEqual([0, 1, 2, 3, 255]);
  });

  test("optionally removes non-alphabet characters", () => {
    expect(
      decoder.run("JxF1-2TrwUP45BMd", [ALPHABET_BITCOIN_B58, true]),
    ).toEqual(Array.from(Buffer.from("Hello World", "utf8")));
    expect(() =>
      decoder.run("JxF1-2TrwUP45BMd", [ALPHABET_BITCOIN_B58, false]),
    ).toThrow("Invalid Base58 character");
  });

  test.each(["short", `${ALPHABET_BITCOIN_B58.slice(0, 57)}1`])(
    "rejects an invalid alphabet: %p",
    (alphabet) => {
      expect(() => encode([1], alphabet)).toThrow(
        "exactly 58 unique characters",
      );
      expect(() => decode("1", alphabet)).toThrow(
        "exactly 58 unique characters",
      );
    },
  );
});
