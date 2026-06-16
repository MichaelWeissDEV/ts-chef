import { FindReplace } from "../../src/chef/operations/FindReplace";

describe("FindReplace", () => {
  const op = new FindReplace();

  test("Simple string replace", () => {
    expect(op.run("hello world", [{ option: "Simple string", string: "world" }, "earth", true, false, false, false])).toBe("hello earth");
  });

  test("Global replace replaces all occurrences", () => {
    expect(op.run("aaa", [{ option: "Simple string", string: "a" }, "b", true, false, false, false])).toBe("bbb");
  });

  test("Non-global replace only replaces first occurrence", () => {
    expect(op.run("aaa", [{ option: "Simple string", string: "a" }, "b", false, false, false, false])).toBe("baa");
  });

  test("Replace with empty string removes matches", () => {
    expect(op.run("hello world", [{ option: "Simple string", string: "o" }, "", true, false, false, false])).toBe("hell wrld");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", [{ option: "Simple string", string: "a" }, "b", true, false, false, false])).toBe("");
  });
});
