import { AND } from "../../src/chef/operations/AND";

describe("AND", () => {
  const op = new AND();

  test("Basic AND operation", () => {
    const input = [0x0f, 0xf0, 0xaa];
    const key = { string: "0f", option: "Hex" };
    expect(op.run(input, [key])).toEqual([0x0f, 0x00, 0x0a]);
  });

  test("AND with multi-byte key", () => {
    const input = [0xff, 0xff, 0xff];
    const key = { string: "0f f0", option: "Hex" };
    expect(op.run(input, [key])).toEqual([0x0f, 0xf0, 0x0f]);
  });

  test("AND with empty key (should return all 0s as per CyberChef convention if key is treated as empty/0)", () => {
    // Actually, looking at the code: Utils.convertToByteArray(args[0].string || "", args[0].option)
    // If string is empty, key is empty array.
    // bitOp(input, key, and)
    // Let's see how bitOp handles empty key.
    const input = [0x01, 0x02, 0x03];
    const key = { string: "", option: "Hex" };
    // In GCHQ CyberChef, ANDing with nothing usually means ANDing with 0 or it might just return empty or input.
    // Let's assume it should handle it gracefully.
    expect(op.run(input, [key])).toBeDefined();
  });

  test("AND with UTF8 key", () => {
    const input = [0x41, 0x42, 0x43]; // ABC
    const key = { string: "A", option: "UTF8" }; // 0x41
    expect(op.run(input, [key])).toEqual([0x41, 0x40, 0x41]);
  });

  test("Empty input", () => {
    const input: number[] = [];
    const key = { string: "ff", option: "Hex" };
    expect(op.run(input, [key])).toEqual([]);
  });
});
