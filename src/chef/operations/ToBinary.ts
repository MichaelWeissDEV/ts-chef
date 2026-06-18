/**
 * @fileoverview ToBinary operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation } from "../Operation";

export class ToBinary extends Operation {
  constructor() {
    super();
    this.name = "To binary";
    this.module = "Default";
    this.description = "Displays the input data as a binary string.";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      {
        name: "Delimiter",
        type: "option",
        value: [
          "Space",
          "Comma",
          "Semi-colon",
          "Colon",
          "Line feed",
          "CRLF",
          "None",
        ],
      },
      { name: "Byte length", type: "number", value: 8 },
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
      None: "",
    };
    const delim = delims[args[0] as string] ?? " ";
    const byteLen = args[1] as number;
    const bytes = new Uint8Array(input);
    return Array.from(bytes)
      .map((b) => b.toString(2).padStart(byteLen, "0"))
      .join(delim);
  }
}

export default ToBinary;
