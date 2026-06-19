/**
 * @fileoverview XMLBeautify operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";

export class XMLBeautify extends TypedOperation<string, string, unknown[]> {
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
