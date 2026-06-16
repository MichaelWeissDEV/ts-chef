import { XMLMinify } from "../../src/chef/operations/XMLMinify";

describe("XMLMinify", () => {
  const op = new XMLMinify();

  test("Removes whitespace between tags", () => {
    const input = "<root>\n  <child>text</child>\n</root>";
    const result = op.run(input, []);
    expect(result).not.toContain("  ");
    expect(result).toContain("<root><child>text</child></root>");
  });

  test("Removes XML comments", () => {
    const input = "<a><!-- comment -->text</a>";
    const result = op.run(input, []);
    expect(result).not.toContain("comment");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", [])).toBe("");
  });

  test("Already minified XML stays the same", () => {
    const input = "<a><b>x</b></a>";
    expect(op.run(input, [])).toBe("<a><b>x</b></a>");
  });

  test("Content is preserved", () => {
    const result = op.run("<root><item>hello</item></root>", []);
    expect(result).toContain("hello");
  });
});
