import { LevenshteinDistance } from "../../src/chef/operations/LevenshteinDistance";

describe("LevenshteinDistance", () => {
  const op = new LevenshteinDistance();

  test("Same strings have distance 0", () => {
    expect(op.run("hello\nhello", ["\n", 1, 1, 1])).toBe(0);
  });

  test("Completely different single chars have distance 1", () => {
    expect(op.run("a\nb", ["\n", 1, 1, 1])).toBe(1);
  });

  test("kitten → sitting has distance 3", () => {
    expect(op.run("kitten\nsitting", ["\n", 1, 1, 1])).toBe(3);
  });

  test("Empty string to 'abc' has distance 3", () => {
    expect(op.run("\nabc", ["\n", 1, 1, 1])).toBe(3);
  });

  test("Custom delimiter separates the two strings", () => {
    expect(op.run("abc|def", ["|", 1, 1, 1])).toBe(3);
  });
});
