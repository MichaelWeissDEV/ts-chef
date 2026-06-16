import { ToOctal } from "../../src/chef/operations/ToOctal";
import { strToAB } from "../helpers";

describe("ToOctal", () => {
  const op = new ToOctal();

  test("Converts 'A' (65) to octal 101", () => {
    expect(op.run(strToAB("A"), ["Space"])).toBe("101");
  });

  test("Converts 'AB' to two octal values", () => {
    expect(op.run(strToAB("AB"), ["Space"])).toBe("101 102");
  });

  test("Uses comma delimiter", () => {
    expect(op.run(strToAB("AB"), ["Comma"])).toBe("101,102");
  });

  test("Empty input returns empty string", () => {
    expect(op.run(strToAB(""), ["Space"])).toBe("");
  });

  test("Null byte is 0 in octal", () => {
    const ab = new ArrayBuffer(1);
    expect(op.run(ab, ["Space"])).toBe("0");
  });
});
