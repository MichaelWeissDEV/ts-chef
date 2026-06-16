import { ToLowerCase } from "../../src/chef/operations/ToLowerCase";

describe("ToLowerCase", () => {
  const op = new ToLowerCase();

  test("Converts uppercase to lowercase", () => {
    expect(op.run("HELLO WORLD", [])).toBe("hello world");
  });

  test("Already lowercase string stays the same", () => {
    expect(op.run("hello", [])).toBe("hello");
  });

  test("Mixed case", () => {
    expect(op.run("hElLo", [])).toBe("hello");
  });

  test("Numbers and symbols unchanged", () => {
    expect(op.run("ABC123!@#", [])).toBe("abc123!@#");
  });

  test("Empty input", () => {
    expect(op.run("", [])).toBe("");
  });
});
