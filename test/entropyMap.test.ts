/**
 * @fileoverview entropyMap.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { bucketFor } from "../src/providers/entropyMapProvider";
import { shannonEntropy } from "../src/providers/magic";

describe("bucketFor", () => {
  test("low entropy lands in the calm bucket", () => {
    expect(bucketFor(0)).toBe(0);
    expect(bucketFor(2)).toBe(0);
  });

  test("buckets increase monotonically with entropy", () => {
    const points = [0, 3.5, 4.5, 5.5, 6.5, 8];
    const buckets = points.map(bucketFor);
    for (let i = 1; i < buckets.length; i++) {
      expect(buckets[i]).toBeGreaterThanOrEqual(buckets[i - 1]);
    }
  });

  test("random-looking data reaches a hotter bucket than prose", () => {
    const prose = shannonEntropy(
      "the quick brown fox jumps over the lazy dog again",
    );
    const random = shannonEntropy("f3A9zQ7xK2mP5vL8nR4wT6yU1bC0dE+/");
    expect(bucketFor(random)).toBeGreaterThan(bucketFor(prose));
  });
});
