/**
 * @fileoverview Argon2Compare.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Argon2Compare } from "../../src/chef/operations/Argon2Compare";
import { Argon2 } from "../../src/chef/operations/Argon2";

describe("Argon2Compare", () => {
  const op = new Argon2Compare();

  test("Match: Correct password", async () => {
    const argon2Op = new Argon2();
    const generatedHash = await argon2Op.run("password", [
      { string: "somesalt", option: "UTF8" },
      3,
      4096,
      1,
      32,
      "Argon2i",
      "Encoded hash",
    ]);

    const result = await op.run("password", [generatedHash]);
    expect(result).toBe("Match: password");
  });

  test("No match: Incorrect password", async () => {
    const argon2Op = new Argon2();
    const generatedHash = await argon2Op.run("password", [
      { string: "somesalt", option: "UTF8" },
      3,
      4096,
      1,
      32,
      "Argon2i",
      "Encoded hash",
    ]);

    const result = await op.run("wrongpassword", [generatedHash]);
    expect(result).toBe("No match");
  });

  test("No match: Invalid hash format", async () => {
    const result = await op.run("password", ["invalidhash"]);
    expect(result).toBe("No match");
  });
});
