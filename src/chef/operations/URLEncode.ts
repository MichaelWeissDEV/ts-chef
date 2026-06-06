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

export class URLEncode extends Operation {
  constructor() {
    super();
    this.name = "URL encode";
    this.module = "URL";
    this.description =
      "Encodes problematic characters into percent-encoded URL safe format.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Encode all special chars", type: "boolean", value: false },
    ];
  }

  run(input: string, args: unknown[]): string {
    const encodeAll = args[0] as boolean;
    if (encodeAll) {
      return Array.from(input)
        .map((ch) => {
          const cp = ch.codePointAt(0)!;
          return "%" + cp.toString(16).toUpperCase().padStart(2, "0");
        })
        .join("");
    }
    return encodeURIComponent(input).replace(/%20/g, "+");
  }
}

export default URLEncode;
