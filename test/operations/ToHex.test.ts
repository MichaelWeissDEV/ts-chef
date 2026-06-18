/**
 * @fileoverview ToHex.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ToHex } from "../../src/chef/operations/ToHex";
import { strToAB } from "../helpers";

describe("ToHex", () => {
  const op = new ToHex();

  test("Converts 'hello' to hex with space delimiter", () => {
    expect(op.run(strToAB("hello"), ["Space", 0])).toBe("68 65 6c 6c 6f");
  });

  test("Converts 'ABC' to hex without delimiter", () => {
    expect(op.run(strToAB("ABC"), ["None", 0])).toBe("414243");
  });

  test("Empty input returns empty string", () => {
    expect(op.run(strToAB(""), ["Space", 0])).toBe("");
  });

  test("Uses colon as delimiter", () => {
    expect(op.run(strToAB("AB"), ["Colon", 0])).toBe("41:42");
  });

  test("Converts null byte to 00", () => {
    const ab = new ArrayBuffer(1);
    expect(op.run(ab, ["None", 0])).toBe("00");
  });
});
