import { StripHTMLTags } from "../../src/chef/operations/StripHTMLTags";

describe("StripHTMLTags", () => {
  const op = new StripHTMLTags();

  test("Removes simple HTML tags", () => {
    const result = op.run("<p>Hello</p>", [true, true]);
    expect(result).not.toContain("<p>");
    expect(result).toContain("Hello");
  });

  test("Removes nested tags", () => {
    const result = op.run("<div><span>text</span></div>", [true, true]);
    expect(result).not.toContain("<div>");
    expect(result).not.toContain("<span>");
    expect(result).toContain("text");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", [true, true])).toBe("");
  });

  test("Plain text unchanged", () => {
    expect(op.run("hello world", [false, false])).toBe("hello world");
  });

  test("Removes self-closing tags", () => {
    const result = op.run("line1<br/>line2", [false, false]);
    expect(result).not.toContain("<br");
  });
});
