/**
 * @fileoverview ConvertSpeed.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ConvertSpeed } from "../../src/chef/operations/ConvertSpeed";

describe("ConvertSpeed", () => {
  const op = new ConvertSpeed();

  test("km/h to m/s", () => {
    expect(
      op.run("36", ["Kilometres per hour (km/h)", "Metres per second (m/s)"]),
    ).toBe("10.0008"); // 36 * 0.2778
  });

  test("mph to m/s", () => {
    expect(
      op.run("10", ["Miles per hour (mph)", "Metres per second (m/s)"]),
    ).toBe("4.4704");
  });
});
