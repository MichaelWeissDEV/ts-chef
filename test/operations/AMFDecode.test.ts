import { AMFDecode } from "../../src/chef/operations/AMFDecode";
import { hexToAB } from "../helpers";

describe("AMFDecode", () => {
  const op = new AMFDecode();

  test("AMF0 decode number", () => {
    const input = hexToAB("003ff3ae147ae147ae");
    const result = op.run(input, ["AMF0"]);
    expect(result).toBe(1.23);
  });

  test("AMF0 decode string", () => {
    const input = hexToAB("02000568656c6c6f");
    const result = op.run(input, ["AMF0"]);
    expect(result).toBe("hello");
  });

  test("AMF3 decode number", () => {
    // AMF3 Integer 123 is 0x04 0x7b
    const input = hexToAB("047b");
    const result = op.run(input, ["AMF3"]);
    expect(result).toBe(123);
  });

  test("AMF3 decode string", () => {
    // AMF3 String "hello" (length 5, shifted left by 1 and bit 0 set to 1 -> 0x0b)
    const input = hexToAB("060b68656c6c6f");
    const result = op.run(input, ["AMF3"]);
    expect(result).toBe("hello");
  });
});
