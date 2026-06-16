import { RotateRight } from "../../src/chef/operations/RotateRight";

describe("RotateRight", () => {
  const op = new RotateRight();

  test("Rotate right by 1 bit", () => {
    // 0b00000001 (0x01) rotated right by 1 = 0b10000000 (0x80)
    expect(op.run([0x01], [1, false])).toEqual([0x80]);
  });

  test("Rotate right by 4 bits", () => {
    // 0b00001111 (0x0F) rotated right by 4 = 0b11110000 (0xF0)
    expect(op.run([0x0f], [4, false])).toEqual([0xf0]);
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
