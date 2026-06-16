import { SHA1 } from "../../src/chef/operations/SHA1";
import { strToAB } from "../helpers";

describe("SHA1", () => {
  const op = new SHA1();

  test("SHA1 of empty string", () => {
    expect(op.run(strToAB(""), [80])).toBe("da39a3ee5e6b4b0d3255bfef95601890afd80709");
  });

  test("SHA1 of 'hello'", () => {
    expect(op.run(strToAB("hello"), [80])).toBe("aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d");
  });

  test("SHA1 of 'The quick brown fox jumps over the lazy dog'", () => {
    expect(op.run(strToAB("The quick brown fox jumps over the lazy dog"), [80])).toBe(
      "2fd4e1c67a2d28fced849ee1bb76e7391b93eb12"
    );
  });

  test("SHA1 produces 40 hex chars", () => {
    expect(op.run(strToAB("test"), [80]).length).toBe(40);
  });

  test("Different inputs produce different hashes", () => {
    const h1 = op.run(strToAB("foo"), [80]);
    const h2 = op.run(strToAB("bar"), [80]);
    expect(h1).not.toBe(h2);
  });
});
