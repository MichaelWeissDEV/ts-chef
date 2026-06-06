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

export class ToOctal extends Operation {
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
