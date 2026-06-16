import { FromMorseCode } from "../../src/chef/operations/FromMorseCode";

describe("FromMorseCode", () => {
  const op = new FromMorseCode();

  test("Decodes SOS from Morse code", () => {
    const result = op.run("... --- ...", ["Space", "Line feed"]);
    expect(result).toContain("SOS");
  });

  test("Decodes '.-' to A", () => {
    expect(op.run(".-", ["Space", "Line feed"])).toBe("A");
  });

  test("Decodes '.' to E", () => {
    expect(op.run(".", ["Space", "Line feed"])).toBe("E");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", ["Space", "Line feed"])).toBe("");
  });

  test("Decodes AB from Morse", () => {
    expect(op.run(".- -...", ["Space", "Line feed"])).toBe("AB");
  });
});
