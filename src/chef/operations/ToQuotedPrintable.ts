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

export class ToQuotedPrintable extends Operation {
  constructor() {
    super();
    this.name = "To quoted-printable";
    this.module = "Default";
    this.description = "Encodes data to quoted-printable format.";
    this.infoURL = "https://wikipedia.org/wiki/Quoted-printable";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [];
  }

  run(input: ArrayBuffer, _args: unknown[]): string {
    const bytes = new Uint8Array(input);
    const lines: string[] = [];
    let line = "";

    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      let token: string;

      if (b === 13 && bytes[i + 1] === 10) {
        lines.push(line);
        line = "";
        i++;
        continue;
      } else if (b === 10) {
        lines.push(line);
        line = "";
        continue;
      } else if ((b >= 33 && b <= 126 && b !== 61) || b === 9 || b === 32) {
        token = String.fromCharCode(b);
      } else {
        token = "=" + b.toString(16).toUpperCase().padStart(2, "0");
      }

      if (line.length + token.length > 75) {
        lines.push(line + "=");
        line = token;
      } else {
        line += token;
      }
    }
    if (line) lines.push(line);
    return lines.join("\r\n");
  }
}

export default ToQuotedPrintable;
