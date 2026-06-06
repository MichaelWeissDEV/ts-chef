import { BLAKE2s } from "../../src/chef/operations/BLAKE2s";
import { strToAB } from "../helpers";
import { OperationError } from "../../src/chef/errors/OperationError";

describe("BLAKE2s", () => {
  const op = new BLAKE2s();

  test("BLAKE2s 256 Hex", () => {
    expect(
      op.run(strToAB("abc"), ["256", "Hex", { string: "", option: "UTF8" }]),
    ).toBe("508c5e8c327c14e2e1a72ba34eeb452f37458b209ed63a294d999b4c86675982");
  });

  test("BLAKE2s 160 Hex", () => {
    expect(
      op.run(strToAB("abc"), ["160", "Hex", { string: "", option: "UTF8" }]),
    ).toBe("5ae3b99be29b01834c3b508521ede60438f8de17");
  });

  test("BLAKE2s 128 Hex", () => {
    expect(
      op.run(strToAB("abc"), ["128", "Hex", { string: "", option: "UTF8" }]),
    ).toBe("aa4938119b1dc7b87cbad0ffd200d0ae");
  });

  test("BLAKE2s 256 Base64", () => {
    expect(
      op.run(strToAB("abc"), ["256", "Base64", { string: "", option: "UTF8" }]),
    ).toBe("UIxejDJ8FOLhpyujTutFLzdFiyCe1jopTZmbTIZnWYI=");
  });

  test("BLAKE2s 256 Hex with Key", () => {
    expect(
      op.run(strToAB("abc"), ["256", "Hex", { string: "key", option: "UTF8" }]),
    ).toBe("3f9723437b033bf0c1f4df43cafd0776068cb0a95912de13f3b2952a3aba764d");
  });

  test("Key too long error", () => {
    const longKey = "a".repeat(33);
    expect(() =>
      op.run(strToAB("abc"), [
        "256",
        "Hex",
        { string: longKey, option: "UTF8" },
      ]),
    ).toThrow(OperationError);
  });

  test("Unsupported Output Type", () => {
    expect(() =>
      op.run(strToAB("abc"), [
        "256",
        "Invalid",
        { string: "", option: "UTF8" },
      ]),
    ).toThrow(OperationError);
  });
});
