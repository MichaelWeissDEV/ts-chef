/**
 * @fileoverview ToBinary.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ToBinary } from "../../src/chef/operations/ToBinary";
import { strToAB } from "../helpers";

describe("ToBinary", () => {
  const op = new ToBinary();

  test("Encodes 'A' to binary", () => {
    expect(op.run(strToAB("A"), ["Space", 8])).toBe("01000001");
  });

  test("Encodes 'hi' to binary with spaces", () => {
    expect(op.run(strToAB("hi"), ["Space", 8])).toBe("01101000 01101001");
  });

  test("Uses comma as delimiter", () => {
    expect(op.run(strToAB("A"), ["Comma", 8])).toBe("01000001");
  });

  test("Empty input returns empty string", () => {
    expect(op.run(strToAB(""), ["Space", 8])).toBe("");
  });

  test("Encodes 'abc' to three space-separated binary values", () => {
    const result = op.run(strToAB("abc"), ["Space", 8]);
    expect(result.split(" ").length).toBe(3);
  });
});
