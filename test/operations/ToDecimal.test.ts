/**
 * @fileoverview ToDecimal.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ToDecimal } from "../../src/chef/operations/ToDecimal";
import { strToAB } from "../helpers";

describe("ToDecimal", () => {
  const op = new ToDecimal();

  test("Converts 'A' to decimal 65", () => {
    expect(op.run(strToAB("A"), ["Space", false])).toBe("65");
  });

  test("Converts 'hi' to two decimal values", () => {
    expect(op.run(strToAB("hi"), ["Space", false])).toBe("104 105");
  });

  test("Uses comma delimiter", () => {
    expect(op.run(strToAB("AB"), ["Comma", false])).toBe("65,66");
  });

  test("Empty input returns empty string", () => {
    expect(op.run(strToAB(""), ["Space", false])).toBe("");
  });

  test("Null byte is 0", () => {
    const ab = new ArrayBuffer(1);
    expect(op.run(ab, ["Space", false])).toBe("0");
  });
});
