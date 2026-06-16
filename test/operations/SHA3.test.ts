import { SHA3 } from "../../src/chef/operations/SHA3";
import { strToAB } from "../helpers";

describe("SHA3", () => {
  const op = new SHA3();

  test("SHA3-256 of empty string", () => {
    expect(op.run(strToAB(""), ["256"])).toBe(
      "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
    );
  });

  test("SHA3-256 of 'hello'", () => {
    expect(op.run(strToAB("hello"), ["256"])).toBe(
      "3338be694f50c5f338814986cdf0686453a888b84f424d792af4b9202398f392",
    );
  });

  test("SHA3-512 produces 128 hex chars", () => {
    expect(op.run(strToAB("test"), ["512"]).length).toBe(128);
  });

  test("SHA3-256 produces 64 hex chars", () => {
    expect(op.run(strToAB("test"), ["256"]).length).toBe(64);
  });

  test("Different inputs produce different hashes", () => {
    const h1 = op.run(strToAB("foo"), ["256"]);
    const h2 = op.run(strToAB("bar"), ["256"]);
    expect(h1).not.toBe(h2);
  });
});
