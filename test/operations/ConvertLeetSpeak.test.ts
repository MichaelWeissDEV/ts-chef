/**
 * @fileoverview ConvertLeetSpeak.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { ConvertLeetSpeak } from "../../src/chef/operations/ConvertLeetSpeak";

describe("ConvertLeetSpeak", () => {
  const op = new ConvertLeetSpeak();

  test("To Leet Speak", () => {
    expect(op.run("hello", ["To Leet Speak"])).toBe("h3ll0");
  });

  test("From Leet Speak", () => {
    expect(op.run("h3ll0", ["From Leet Speak"])).toBe("hello");
  });

  test("Mixed case", () => {
    expect(op.run("Hello World", ["To Leet Speak"])).toBe("H3ll0 W0rld");
  });
});
