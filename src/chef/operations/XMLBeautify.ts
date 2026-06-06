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

import { Operation } from "../Operation";

export class XMLBeautify extends Operation {
  constructor() {
    super();
    this.name = "XML Beautify";
    this.module = "Default";
    this.description = "Indents and prettifies XML markup.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Indent string", type: "binaryShortString", value: "\\t" },
    ];
  }

  run(input: string, args: unknown[]): string {
    let indent = (args[0] as string)
      .replace(/\\t/g, "\t")
      .replace(/\\n/g, "\n");
    if (!indent) indent = "\t";

    const tokens = input
      .replace(/>\s*</g, "><")
      .replace(/(<[^>]*>)/g, "\n$1\n")
      .split(/\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    let depth = 0;
    const lines: string[] = [];

    for (const token of tokens) {
      if (/^<\//.test(token)) {
        depth = Math.max(0, depth - 1);
        lines.push(indent.repeat(depth) + token);
      } else if (/^<[^?!][^>]*[^/]>$/.test(token) && !/^<.+\/>$/.test(token)) {
        lines.push(indent.repeat(depth) + token);
        if (!/^<[^?!][^>]*\/>$/.test(token)) depth++;
      } else {
        lines.push(indent.repeat(depth) + token);
      }
    }

    return lines.join("\n");
  }
}

export default XMLBeautify;
