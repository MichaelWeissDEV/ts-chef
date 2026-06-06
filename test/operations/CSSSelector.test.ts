import { CSSSelector } from "../../src/chef/operations/CSSSelector";

describe("CSSSelector", () => {
  const op = new CSSSelector();
  const HTML = `
        <html>
            <body>
                <div class="test">Item 1</div>
                <div class="test">Item 2</div>
                <span id="target">Target</span>
                <ul>
                    <li>L1</li>
                    <li>L2</li>
                </ul>
            </body>
        </html>
    `;

  test("Extract by class", () => {
    const result = op.run(HTML, [".test", "\n"]);
    expect(result).toBe(
      '<div class="test">Item 1</div>\n<div class="test">Item 2</div>',
    );
  });

  test("Extract by id", () => {
    const result = op.run(HTML, ["#target", "\n"]);
    expect(result).toBe('<span id="target">Target</span>');
  });

  test("Extract by tag", () => {
    const result = op.run(HTML, ["li", ", "]);
    expect(result).toBe("<li>L1</li>, <li>L2</li>");
  });

  test("Invalid selector", () => {
    expect(() => op.run(HTML, ["!!invalid!!", "\n"])).toThrow(
      /Invalid CSS Selector/,
    );
  });

  test("Empty input", () => {
    const result = op.run("", ["div", "\n"]);
    expect(result).toBe("");
  });

  test("Empty selector", () => {
    const result = op.run(HTML, ["", "\n"]);
    expect(result).toBe("");
  });
});
