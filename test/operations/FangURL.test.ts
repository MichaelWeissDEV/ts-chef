/**
 * @fileoverview FangURL.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { FangURL } from "../../src/chef/operations/FangURL";

describe("FangURL", () => {
  const op = new FangURL();

  test("Restores hxxp to http", () => {
    expect(op.run("hxxp://example[.]com", [true, true, true])).toContain(
      "http://",
    );
  });

  test("Restores [.] to .", () => {
    expect(op.run("example[.]com", [true, true, true])).toContain(
      "example.com",
    );
  });

  test("Restores [//] to //", () => {
    expect(op.run("http[://]example.com", [true, true, true])).toContain(
      "http://",
    );
  });

  test("Plain text unchanged", () => {
    expect(op.run("hello world", [true, true, true])).toBe("hello world");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", [true, true, true])).toBe("");
  });
});
