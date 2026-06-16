import { SHA2 } from "../../src/chef/operations/SHA2";
import { strToAB } from "../helpers";

describe("SHA2", () => {
  const op = new SHA2();

  test("SHA-256 of empty string", () => {
    expect(op.run(strToAB(""), ["256"])).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );
  });

  test("SHA-256 of 'hello'", () => {
    expect(op.run(strToAB("hello"), ["256"])).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
    );
  });

  test("SHA-512 produces 128 hex chars", () => {
    expect(op.run(strToAB("test"), ["512"]).length).toBe(128);
  });

  test("SHA-256 produces 64 hex chars", () => {
    expect(op.run(strToAB("test"), ["256"]).length).toBe(64);
  });

  test("Different inputs produce different hashes", () => {
    const h1 = op.run(strToAB("foo"), ["256"]);
    const h2 = op.run(strToAB("bar"), ["256"]);
    expect(h1).not.toBe(h2);
  });
});
