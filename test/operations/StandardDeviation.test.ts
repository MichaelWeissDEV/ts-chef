/**
 * @fileoverview StandardDeviation.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { StandardDeviation } from "../../src/chef/operations/StandardDeviation";

describe("StandardDeviation", () => {
  const op = new StandardDeviation();

  test("StdDev of identical values is 0", () => {
    expect(op.run("5\n5\n5", ["Line feed"]).toNumber()).toBe(0);
  });

  test("StdDev of 2, 4, 4, 4, 5, 5, 7, 9 is 2", () => {
    expect(op.run("2\n4\n4\n4\n5\n5\n7\n9", ["Line feed"]).toNumber()).toBe(2);
  });

  test("StdDev of a single number is 0", () => {
    expect(op.run("10", ["Line feed"]).toNumber()).toBe(0);
  });

  test("StdDev with space delimiter", () => {
    const result = op.run("1 2 3", ["Space"]).toNumber();
    expect(result).toBeGreaterThan(0);
  });

  test("StdDev result is non-negative", () => {
    const result = op.run("1\n5\n10", ["Line feed"]).toNumber();
    expect(result).toBeGreaterThanOrEqual(0);
  });
});
