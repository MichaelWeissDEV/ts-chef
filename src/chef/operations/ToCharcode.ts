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
import { OperationError } from "../errors/OperationError";

export class ToCharcode extends Operation {
  constructor() {
    super();
    this.name = "To charcode";
    this.module = "Default";
    this.description =
      "Converts text to its Unicode character code equivalents.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Delimiter",
        type: "option",
        value: ["Space", "Comma", "Semi-colon", "Colon", "Line feed", "CRLF"],
      },
      { name: "Base", type: "number", value: 10 },
    ];
  }

  run(input: string, args: unknown[]): string {
    const delims: Record<string, string> = {
      Space: " ",
      Comma: ",",
      "Semi-colon": ";",
      Colon: ":",
      "Line feed": "\n",
      CRLF: "\r\n",
    };
    const delim = delims[args[0] as string] ?? " ";
    const base = args[1] as number;
    if (base < 2 || base > 36) {
      throw new OperationError("Base must be between 2 and 36");
    }
    const codes: string[] = [];
    for (const ch of input) {
      codes.push(ch.codePointAt(0)!.toString(base));
    }
    return codes.join(delim);
  }
}

export default ToCharcode;
