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
import { fromHex } from "../lib/Hex";

export class FromHexContent extends Operation {
  constructor() {
    super();
    this.name = "From Hex Content";
    this.module = "Default";
    this.description =
      "Translates hexadecimal bytes in text back to raw bytes. This format is used by SNORT for representing hex within ASCII text.<br><br>e.g. <code>foo|3d|bar</code> becomes <code>foo=bar</code>.";
    this.infoURL =
      "http://manual-snort-org.s3-website-us-east-1.amazonaws.com/node32.html#SECTION00451000000000000000";
    this.inputType = "string";
    this.outputType = "byteArray";
    this.args = [];
    this.checks = [
      {
        pattern: "\\|([\\da-f]{2} ?)+\\|",
        flags: "i",
        args: [],
      },
    ];
  }

  run(input: string, _args: unknown[]): number[] {
    const regex = /\|([a-f\d ]{2,})\|/gi;
    const output: number[] = [];
    let m: RegExpExecArray | null;
    let i = 0;

    while ((m = regex.exec(input))) {
      for (; i < m.index; ) output.push(Utils.ord(input[i++]));

      const bytes = fromHex(m[1]);
      if (bytes && bytes.length > 0) {
        for (let a = 0; a < bytes.length; ) output.push(bytes[a++]);
      } else {
        for (; i < regex.lastIndex; ) output.push(Utils.ord(input[i++]));
      }

      i = regex.lastIndex;
    }

    for (; i < input.length; ) output.push(Utils.ord(input[i++]));

    return output;
  }
}

export default FromHexContent;
