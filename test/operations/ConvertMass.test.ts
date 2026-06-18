/**
 * @fileoverview ConvertMass.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ConvertMass } from "../../src/chef/operations/ConvertMass";

describe("ConvertMass", () => {
  const op = new ConvertMass();

  test("Gram to Kilogram", () => {
    expect(op.run("1500", ["Gram (g)", "Kilogram (kg)"])).toBe("1.5");
  });

  test("Pound to Ounce", () => {
    expect(op.run("1", ["Pound (lb)", "Ounce (oz)"])).toBe("16");
  });
});
