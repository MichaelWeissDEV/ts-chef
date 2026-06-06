import { BLAKE2b } from "../../src/chef/operations/BLAKE2b";
import { strToAB } from "../helpers";

describe("BLAKE2b", () => {
  const op = new BLAKE2b();
  const input = strToAB("hello");

  test("BLAKE2b-512 Hex", () => {
    const result = op.run(input, [
      "512",
      "Hex",
      { string: "", option: "UTF8" },
    ]);
    expect(result).toBe(
      "e4cfa39a3d37be31c59609e807970799caa68a19bfaa15135f165085e01d41a65ba1e1b146aeb6bd0092b49eac214c103ccfa3a365954bbbe52f74a2b3620c94",
    );
  });

  test("BLAKE2b-256 Base64", () => {
    const result = op.run(input, [
      "256",
      "Base64",
      { string: "", option: "UTF8" },
    ]);
    expect(result).toBe("Mk3PAn3UowqTLEQfNlol6GsXPe+kuOWJSCU0cbgbcs8=");
  });

  test("BLAKE2b-512 with Key", () => {
    const key = { string: "key", option: "UTF8" };
    const result = op.run(input, ["512", "Hex", key]);
    expect(result).not.toBe(
      "e4cfa39a3d37be37c59609e807970799caa68a19bfaa15135f165085e01d41a65ba1e1b146aeb6bd00973acc45a7969a177dd773199327ae1350912e58eb2f7c",
    );
  });

  test("Invalid Key length (> 64 bytes)", () => {
    const longKey = { string: "a".repeat(65), option: "UTF8" };
    expect(() => op.run(input, ["512", "Hex", longKey])).toThrow(
      /Key cannot be greater than 64 bytes/,
    );
  });

  test("Raw output", () => {
    const result = op.run(input, [
      "128",
      "Raw",
      { string: "", option: "UTF8" },
    ]);
    expect(result.length).toBe(16);
  });
});
