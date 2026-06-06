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
