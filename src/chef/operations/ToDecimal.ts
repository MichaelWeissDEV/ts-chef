/**
 * @fileoverview ToDecimal operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation } from "../Operation";

export class ToDecimal extends Operation {
  constructor() {
    super();
    this.name = "To decimal";
    this.module = "Default";
    this.description =
      "Converts the input byte array to an array of decimal values.";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      {
        name: "Delimiter",
        type: "option",
        value: ["Space", "Comma", "Semi-colon", "Colon", "Line feed", "CRLF"],
      },
      { name: "Support signed values", type: "boolean", value: false },
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
    const signed = args[1] as boolean;
    const bytes = new Uint8Array(input);
    return Array.from(bytes)
      .map((b) => (signed && b > 127 ? b - 256 : b).toString())
      .join(delim);
  }
}

export default ToDecimal;
