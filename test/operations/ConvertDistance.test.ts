/**
 * @fileoverview ConvertDistance.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ConvertDistance } from "../../src/chef/operations/ConvertDistance";

describe("ConvertDistance", () => {
  const op = new ConvertDistance();

  test("Metres to Kilometers", () => {
    expect(op.run("1000", ["Metres (m)", "Kilometers (km)"])).toEqual("1");
  });

  test("Kilometers to Metres", () => {
    expect(op.run("1", ["Kilometers (km)", "Metres (m)"])).toEqual("1000");
  });

  test("Inches to Feet", () => {
    expect(op.run("12", ["Inches (in)", "Feet (ft)"])).toEqual("1");
  });

  test("Feet to Metres", () => {
    // 1 foot = 0.3048 metres
    expect(op.run("1", ["Feet (ft)", "Metres (m)"])).toEqual("0.3048");
  });

  test("Nautical miles to Metres", () => {
    expect(op.run("1", ["Nautical miles", "Metres (m)"])).toEqual("1853.184");
  });

  test("Empty/Zero input", () => {
    expect(op.run("0", ["Metres (m)", "Kilometers (km)"])).toEqual("0");
  });
});
