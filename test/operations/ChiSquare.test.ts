import { ChiSquare } from "../../src/chef/operations/ChiSquare";

describe("ChiSquare", () => {
  const op = new ChiSquare();

  test("Uniform distribution (0-255)", () => {
    const data = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      data[i] = i;
    }
    expect(op.run(data.buffer, [])).toBe(0);
  });

  test("Non-uniform distribution (all zeros)", () => {
    const length = 256;
    const data = new Uint8Array(length).fill(0);
    // distArray[0] = 256
    // expected = (256 - 1)^2 / 1 = 255^2 = 65025
    expect(op.run(data.buffer, [])).toBe(65025);
  });

  test("Empty input", () => {
    const data = new Uint8Array(0);
    expect(op.run(data.buffer, [])).toBe(0);
  });
});
