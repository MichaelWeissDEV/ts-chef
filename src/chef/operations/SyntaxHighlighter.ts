/**
 * @fileoverview SyntaxHighlighter operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import hljs from "highlight.js";
import { TypedOperation, HighlightPos, HighlightResult } from "../Operation_new";

export class SyntaxHighlighter extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "Syntax highlighter";
    this.module = "Code";
    this.description =
      "Adds syntax highlighting to a range of source code languages. Note that this will not indent the code.";
    this.infoURL = "https://wikipedia.org/wiki/Syntax_highlighting";
    this.inputType = "string";
    this.outputType = "html";
    this.args = [
      {
        name: "Language",
        type: "option",
        value: ["auto detect"].concat(hljs.listLanguages()),
      },
    ];
  }

  run(input: string, args: unknown[]): string {
    const language = args[0] as string;
    if (language === "auto detect") {
      return hljs.highlightAuto(input).value;
    }
    return hljs.highlight(input, { language }).value;
  }

  highlight(pos: HighlightPos, _args: unknown[]): HighlightResult {
    return pos;
  }

  highlightReverse(pos: HighlightPos, _args: unknown[]): HighlightResult {
    return pos;
  }
}

export default SyntaxHighlighter;
