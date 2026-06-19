/**
 * @fileoverview StripHTMLTags operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";
import { Utils } from "../Utils";

export class StripHTMLTags extends TypedOperation<string, string, unknown[]> {
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
