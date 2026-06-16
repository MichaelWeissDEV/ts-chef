import { ToCamelCase } from "../../src/chef/operations/ToCamelCase";

describe("ToCamelCase", () => {
  const op = new ToCamelCase();

  test("Converts hyphen-separated to camelCase", () => {
    expect(op.run("hello-world", [false])).toBe("helloWorld");
  });

  test("Converts space-separated to camelCase", () => {
    expect(op.run("hello world", [false])).toBe("helloWorld");
  });

  test("Converts underscore-separated to camelCase", () => {
    expect(op.run("hello_world", [false])).toBe("helloWorld");
  });

  test("Already camelCase stays camelCase", () => {
    expect(op.run("helloWorld", [false])).toBe("helloWorld");
  });

  test("Empty input", () => {
    expect(op.run("", [false])).toBe("");
  });
});
