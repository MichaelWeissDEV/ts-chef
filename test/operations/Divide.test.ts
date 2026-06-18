/**
 * @fileoverview Divide.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Divide } from "../../src/chef/operations/Divide";

import BigNumber from "bignumber.js";

describe("Divide", () => {
  const op = new Divide();

  test("12 divided by 4 is 3", () => {
    const result = op.run("12\n4", ["Line feed"]) as BigNumber;
    expect(result.toNumber()).toBe(3);
  });

  test("Single number returns that number", () => {
    const result = op.run("7", ["Line feed"]) as BigNumber;
    expect(result.toNumber()).toBe(7);
  });

  test("10 divided by 2 divided by 5 is 1", () => {
    const result = op.run("10\n2\n5", ["Line feed"]) as BigNumber;
    expect(result.toNumber()).toBe(1);
  });

  test("100 divided by 4 is 25", () => {
    const result = op.run("100\n4", ["Line feed"]) as BigNumber;
    expect(result.toNumber()).toBe(25);
  });

  test("Division with comma delimiter", () => {
    const result = op.run("20,5", ["Comma"]) as BigNumber;
    expect(result.toNumber()).toBe(4);
  });
});
