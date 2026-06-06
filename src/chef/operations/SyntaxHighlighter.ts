/*
 * -----------------------------------------------------------------------------
 * Project:     ts-chef
 * Model:       Qwen 3.5 Coder Next (Local)
 * Version:     1.0.0
 * Author:      Michael Weiss
 * Source:      Ported from GCHQ's CyberChef (JavaScript)
 * License:     Apache License 2.0
 * Description: TypeScript implementation of CyberChef modules.
 * Note:        First Port done by Local Model, Cleanup and fixes by Author
 * -----------------------------------------------------------------------------
 */

import hljs from "highlight.js";
import { Operation, HighlightPos, HighlightResult } from "../Operation";

export class SyntaxHighlighter extends Operation {
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
