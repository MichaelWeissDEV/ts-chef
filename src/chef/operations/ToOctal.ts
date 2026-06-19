/**
 * @fileoverview ToOctal operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";

export class ToOctal extends TypedOperation<ArrayBuffer, string, unknown[]> {
  constructor() {
    super();
    this.name = "To octal";
    this.module = "Default";
    this.description =
      "Converts the input string to octal bytes separated by a delimiter.";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      {
        name: "Delimiter",
        type: "option",
        value: ["Space", "Comma", "Semi-colon", "Colon", "Line feed", "CRLF"],
      },
    ];
  }

  run(input: ArrayBuffer, args: unknown[]): string {
    const delims: Record<string, string> = {
      Space: " ",
      Comma: ",",
      "Semi-colon": ";",
      Colon: ":",
      "Line feed": "\n",
      CRLF: "\r\n",
    };
    const delim = delims[args[0] as string] ?? " ";
    const bytes = new Uint8Array(input);
    return Array.from(bytes)
      .map((b) => b.toString(8))
      .join(delim);
  }
}

export default ToOctal;
