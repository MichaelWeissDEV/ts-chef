/**
 * @fileoverview FromHexContent operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";
import { Utils } from "../Utils";
import { fromHex } from "../lib/Hex";

export class FromHexContent extends TypedOperation<string, number[], unknown[]> {
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
