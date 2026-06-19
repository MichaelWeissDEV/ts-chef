/**
 * @fileoverview FromQuotedPrintable operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";

export class FromQuotedPrintable extends TypedOperation<string, number[], unknown[]> {
  constructor() {
    super();
    this.name = "From Quoted Printable";
    this.module = "Default";
    this.description =
      "Converts QP-encoded text back to standard text. This format is a content transfer encoding common in email messages.<br><br>e.g. The quoted-printable encoded string <code>hello=20world</code> becomes <code>hello world</code>";
    this.infoURL = "https://wikipedia.org/wiki/Quoted-printable";
    this.inputType = "string";
    this.outputType = "byteArray";
    this.args = [];
    this.checks = [
      {
        pattern:
          "^[\\x21-\\x3d\\x3f-\\x7e \\t]{0,76}(?:=[\\da-f]{2}|=\\r?\\n)(?:[\\x21-\\x3d\\x3f-\\x7e \\t]|=[\\da-f]{2}|=\\r?\\n)*$",
        flags: "i",
        args: [],
      },
    ];
  }

  run(input: string, _args: unknown[]): number[] {
    const str = input.replace(/=(?:\r?\n|$)/g, "");

    const encodedBytesCount = (str.match(/=[\da-fA-F]{2}/g) || []).length;
    const bufferLength = str.length - encodedBytesCount * 2;
    const buffer = new Array(bufferLength);
    let bufferPos = 0;

    for (let i = 0, len = str.length; i < len; i++) {
      const chr = str.charAt(i);
      if (chr === "=") {
        const hex = str.substr(i + 1, 2);
        if (/[\da-fA-F]{2}/.test(hex)) {
          buffer[bufferPos++] = parseInt(hex, 16);
          i += 2;
          continue;
        }
      }
      buffer[bufferPos++] = chr.charCodeAt(0);
    }

    return buffer;
  }
}

export default FromQuotedPrintable;
