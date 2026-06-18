/**
 * @fileoverview RemoveDiacritics.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { RemoveDiacritics } from "../../src/chef/operations/RemoveDiacritics";

describe("RemoveDiacritics", () => {
  const op = new RemoveDiacritics();

  test("Removes accents from French chars", () => {
    expect(op.run("café", [])).toBe("cafe");
  });

  test("Removes multiple diacritics", () => {
    expect(op.run("naïve résumé", [])).toBe("naive resume");
  });

  test("String without diacritics unchanged", () => {
    expect(op.run("hello world", [])).toBe("hello world");
  });

  test("German umlauts are stripped of diacritics", () => {
    expect(op.run("über", [])).toBe("uber");
  });

  test("Empty input", () => {
    expect(op.run("", [])).toBe("");
  });
});
