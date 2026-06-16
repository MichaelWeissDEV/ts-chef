import { ToKebabCase } from "../../src/chef/operations/ToKebabCase";

describe("ToKebabCase", () => {
  const op = new ToKebabCase();

  test("Converts camelCase to kebab-case", () => {
    expect(op.run("helloWorld", [false])).toBe("hello-world");
  });

  test("Converts spaces to hyphens", () => {
    expect(op.run("hello world", [false])).toBe("hello-world");
  });

  test("Converts underscores to hyphens", () => {
    expect(op.run("hello_world", [false])).toBe("hello-world");
  });

  test("Lowercases the result", () => {
    expect(op.run("Hello World", [false])).toBe("hello-world");
  });

  test("Empty input", () => {
    expect(op.run("", [false])).toBe("");
  });
});
