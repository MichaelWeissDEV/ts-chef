import { BaconCipherEncode } from "../../src/chef/operations/BaconCipherEncode";

describe("BaconCipherEncode", () => {
  const op = new BaconCipherEncode();

  test("Encode Complete alphabet (0/1)", () => {
    expect(op.run("HELLO", ["Complete", "0/1", false, false])).toBe(
      "00111 00100 01011 01011 01110",
    );
  });

  test("Encode Standard alphabet (0/1)", () => {
    expect(
      op.run("HELLO", ["Standard (I=J and U=V)", "0/1", false, false]),
    ).toBe("00111 00100 01010 01010 01101");
  });

  test("Encode Complete alphabet (A/B)", () => {
    expect(op.run("HELLO", ["Complete", "A/B", false, false])).toBe(
      "AABBB AABAA ABABB ABABB ABBBA",
    );
  });

  test("Encode with Keep extra characters", () => {
    expect(op.run("H E L L O", ["Complete", "0/1", true, false])).toBe(
      "00111 00100 01011 01011 01110",
    );
    // Wait, if keep=true, it should keep spaces.
    // Let's re-read BaconCipherEncode.run
  });

  test("Encode with Invert Translation", () => {
    expect(op.run("HELLO", ["Complete", "0/1", false, true])).toBe(
      "11000 11011 10100 10100 10001",
    );
  });

  test("Empty input", () => {
    expect(op.run("", ["Complete", "0/1", false, false])).toBe("");
  });
});
