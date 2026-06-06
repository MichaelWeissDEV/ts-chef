import { Comment } from "../../src/chef/operations/Comment";

describe("Comment", () => {
  const operation = new Comment();

  test("should return input unchanged with empty comment", () => {
    const input = "test input";
    const args = [""];
    expect(operation.run(input, args)).toBe(input);
  });

  test("should return input unchanged with non-empty comment", () => {
    const input = "another test";
    const args = ["this is a comment"];
    expect(operation.run(input, args)).toBe(input);
  });

  test("should return input unchanged with multiline comment", () => {
    const input = "data";
    const args = ["line 1\nline 2"];
    expect(operation.run(input, args)).toBe(input);
  });
});
