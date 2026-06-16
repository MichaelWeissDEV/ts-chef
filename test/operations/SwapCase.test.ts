import { SwapCase } from "../../src/chef/operations/SwapCase";

describe("SwapCase", () => {
  const op = new SwapCase();

  test("Swaps lowercase to uppercase and vice versa", () => {
    expect(op.run("Hello World", [])).toBe("hELLO wORLD");
  });

  test("All lowercase becomes all uppercase", () => {
    expect(op.run("hello", [])).toBe("HELLO");
  });

  test("All uppercase becomes all lowercase", () => {
    expect(op.run("HELLO", [])).toBe("hello");
  });

  test("Non-alpha chars are unchanged", () => {
    expect(op.run("123!@#", [])).toBe("123!@#");
  });

  test("Empty input", () => {
    expect(op.run("", [])).toBe("");
  });
});
