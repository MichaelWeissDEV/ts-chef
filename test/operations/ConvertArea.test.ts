/**
 * @fileoverview ConvertArea.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ConvertArea } from "../../src/chef/operations/ConvertArea";

describe("ConvertArea", () => {
  const op = new ConvertArea();

  test("Square metre to Square kilometre", () => {
    expect(
      op.run("1000000", ["Square metre (sq m)", "Square kilometre (sq km)"]),
    ).toEqual("1");
  });

  test("Square kilometre to Square metre", () => {
    expect(
      op.run("1", ["Square kilometre (sq km)", "Square metre (sq m)"]),
    ).toEqual("1000000");
  });

  test("Hectare to Square metre", () => {
    expect(op.run("1", ["Hectare (ha)", "Square metre (sq m)"])).toEqual(
      "10000",
    );
  });

  test("Square inch to Square foot", () => {
    // 144 sq in = 1 sq ft
    expect(
      op.run("144", ["Square inch (sq in)", "Square foot (sq ft)"]),
    ).toEqual("1");
  });

  test("Barn to Millibarn", () => {
    expect(op.run("1", ["Barn (b)", "Millibarn (mb)"])).toEqual("1000");
  });

  test("Wales to Square metre", () => {
    expect(op.run("1", ["Wales", "Square metre (sq m)"])).toEqual(
      "20779000000",
    );
  });

  test("Empty/Zero input", () => {
    expect(
      op.run("0", ["Square metre (sq m)", "Square kilometre (sq km)"]),
    ).toEqual("0");
  });
});
