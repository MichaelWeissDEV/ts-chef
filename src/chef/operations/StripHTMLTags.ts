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
import { Utils } from "../Utils";

export class StripHTMLTags extends Operation {
  constructor() {
    super();
    this.name = "Strip HTML tags";
    this.module = "Default";
    this.description = "Removes all HTML tags from the input.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Remove indentation", type: "boolean", value: true },
      { name: "Remove excess line breaks", type: "boolean", value: true },
    ];
  }

  run(input: string, args: unknown[]): string {
    const [removeIndentation, removeLineBreaks] = args as boolean[];
    let result = Utils.stripHtmlTags(input);
    if (removeIndentation) {
      result = result.replace(/\n[ \f\t]+/g, "\n");
    }
    if (removeLineBreaks) {
      result = result.replace(/^\s*\n/, "").replace(/(\n\s*){2,}/g, "\n");
    }
    return result;
  }
}

export default StripHTMLTags;
