import { CaretMdecode } from "../../src/chef/operations/CaretMdecode";

describe("CaretMdecode", () => {
  const op = new CaretMdecode();

  test("Caret notation (Control characters)", () => {
    // ^M is CR (13)
    // ^@ is NULL (0)
    // ^[ is ESC (27)
    expect(op.run("^M", [])).toEqual([13]);
    expect(op.run("^@", [])).toEqual([0]);
    expect(op.run("^[", [])).toEqual([27]);
  });

  test("M- notation", () => {
    // M-a is 'a' + 128 = 97 + 128 = 225
    expect(op.run("M-a", [])).toEqual([225]);
  });

  test("M-^ notation", () => {
    // M-^] is 0x1d + 128 = 29 + 128 = 157 (0x9d)
    // ^] is 29
    expect(op.run("M-^]", [])).toEqual([157]);
  });

  test("Plain text", () => {
    expect(op.run("Hello", [])).toEqual([72, 101, 108, 108, 111]);
  });

  test("Mixed notation", () => {
    // Hello^M
    expect(op.run("Hello^M", [])).toEqual([72, 101, 108, 108, 111, 13]);
  });

  test("Invalid caret/M sequences should be preserved as literals", () => {
    expect(op.run("^ ", [])).toEqual([94, 32]);
    expect(op.run("Ma", [])).toEqual([77, 97]);
    expect(op.run("M-^ ", [])).toEqual([77, 45, 94, 32]);
  });
});
