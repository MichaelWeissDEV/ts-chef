import { RotateLeft } from "../../src/chef/operations/RotateLeft";

describe("RotateLeft", () => {
  const op = new RotateLeft();

  test("Rotate left by 1 bit", () => {
    // 0b10000000 (0x80) rotated left by 1 = 0b00000001 (0x01)
    expect(op.run([0x80], [1, false])).toEqual([0x01]);
  });

  test("Rotate left by 4 bits", () => {
    // 0b11110000 (0xF0) rotated left by 4 = 0b00001111 (0x0F)
    expect(op.run([0xf0], [4, false])).toEqual([0x0f]);
  });

  test("All zeros stays zero", () => {
    expect(op.run([0x00], [3, false])).toEqual([0x00]);
  });

  test("All ones (0xFF) stays 0xFF after any rotation", () => {
    expect(op.run([0xff], [3, false])).toEqual([0xff]);
  });

  test("Empty input returns empty", () => {
    expect(op.run([], [1, false])).toEqual([]);
  });
});
