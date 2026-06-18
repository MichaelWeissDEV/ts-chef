import { Keccak } from "../../src/chef/operations/Keccak";
import { strToAB } from "../helpers";

describe("Keccak", () => {
  const op = new Keccak();

  test("Keccak-256 of empty string", () => {
    expect(op.run(strToAB(""), ["256"])).toBe(
      "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    );
  });

  test("Keccak-256 of 'hello'", () => {
    expect(op.run(strToAB("hello"), ["256"])).toBe(
      "1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8",
    );
  });

  test("Keccak-256 produces 64 hex chars", () => {
    expect((op.run(strToAB("test"), ["256"]) as string).length).toBe(64);
  });

  test("Keccak-512 produces 128 hex chars", () => {
    expect((op.run(strToAB("test"), ["512"]) as string).length).toBe(128);
  });

  test("Different inputs produce different hashes", () => {
    const h1 = op.run(strToAB("foo"), ["256"]);
    const h2 = op.run(strToAB("bar"), ["256"]);
    expect(h1).not.toBe(h2);
  });
});
