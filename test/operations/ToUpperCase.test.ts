import { ToUpperCase } from "../../src/chef/operations/ToUpperCase";

describe("ToUpperCase", () => {
  const op = new ToUpperCase();

  test("Converts lowercase to uppercase", () => {
    expect(op.run("hello world", [])).toBe("HELLO WORLD");
  });

  test("Already uppercase string stays the same", () => {
    expect(op.run("HELLO", [])).toBe("HELLO");
  });

  test("Mixed case", () => {
    expect(op.run("hElLo", [])).toBe("HELLO");
  });

  test("Numbers and symbols unchanged", () => {
    expect(op.run("abc123!@#", [])).toBe("ABC123!@#");
  });

  test("Empty input", () => {
    expect(op.run("", [])).toBe("");
  });
});
