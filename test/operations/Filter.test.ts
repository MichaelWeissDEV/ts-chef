import { Filter } from "../../src/chef/operations/Filter";

describe("Filter", () => {
  const op = new Filter();

  test("Keeps lines matching regex", () => {
    const input = "foo\nbar\nbaz";
    expect(op.run(input, ["Line feed", "^b", false])).toBe("bar\nbaz");
  });

  test("Inverted filter keeps non-matching lines", () => {
    const input = "foo\nbar\nbaz";
    expect(op.run(input, ["Line feed", "^b", true])).toBe("foo");
  });

  test("Empty regex keeps all lines", () => {
    const input = "foo\nbar";
    expect(op.run(input, ["Line feed", "", false])).toBe("foo\nbar");
  });

  test("No matching lines returns empty", () => {
    const input = "foo\nbar";
    expect(op.run(input, ["Line feed", "^z", false])).toBe("");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", ["Line feed", ".*", false])).toBe("");
  });
});
