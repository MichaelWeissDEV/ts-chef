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

import { Operation, HighlightPos, HighlightResult } from "../Operation";
import { fromHex, FROM_HEX_DELIM_OPTIONS } from "../lib/Hex";
import { Utils } from "../Utils";

export class FromHex extends Operation {
  constructor() {
    super();
    this.name = "From Hex";
    this.module = "Default";
    this.description =
      "Converts a hexadecimal byte string back into its raw value.<br><br>e.g. <code>ce 93 ce b5 ce b9 ce ac 20 cf 83 ce bf cf 85 0a</code> becomes the UTF-8 encoded string <code>Geia sou</code>";
    this.infoURL = "https://wikipedia.org/wiki/Hexadecimal";
    this.inputType = "string";
    this.outputType = "byteArray";
    this.args = [
      {
        name: "Delimiter",
        type: "option",
        value: FROM_HEX_DELIM_OPTIONS,
      },
    ];
    this.checks = [
      { pattern: "^(?:[\\dA-F]{2})+$", flags: "i", args: ["None"] },
      {
        pattern: "^[\\dA-F]{2}(?: [\\dA-F]{2})*$",
        flags: "i",
        args: ["Space"],
      },
      {
        pattern: "^[\\dA-F]{2}(?:,[\\dA-F]{2})*$",
        flags: "i",
        args: ["Comma"],
      },
      {
        pattern: "^[\\dA-F]{2}(?:;[\\dA-F]{2})*$",
        flags: "i",
        args: ["Semi-colon"],
      },
      {
        pattern: "^[\\dA-F]{2}(?::[\\dA-F]{2})*$",
        flags: "i",
        args: ["Colon"],
      },
      {
        pattern: "^[\\dA-F]{2}(?:\\n[\\dA-F]{2})*$",
        flags: "i",
        args: ["Line feed"],
      },
      {
        pattern: "^[\\dA-F]{2}(?:\\r\\n[\\dA-F]{2})*$",
        flags: "i",
        args: ["CRLF"],
      },
      { pattern: "^(?:0x[\\dA-F]{2})+$", flags: "i", args: ["0x"] },
      {
        pattern: "^0x[\\dA-F]{2}(?:,0x[\\dA-F]{2})*$",
        flags: "i",
        args: ["0x with comma"],
      },
      { pattern: "^(?:\\\\x[\\dA-F]{2})+$", flags: "i", args: ["\\x"] },
    ];
  }

  run(input: string, args: unknown[]): number[] {
    const delim = (args[0] as string) || "Auto";
    return fromHex(input, delim, 2);
  }

  highlight(pos: HighlightPos, args: unknown[]): HighlightResult {
    const delimStr = (args[0] as string) || "Space";
    if (delimStr === "Auto") return false;
    const delim = Utils.charRep(delimStr);
    const len = delim === "\r\n" ? 1 : delim.length;
    const width = len + 2;

    if (delim === "0x" || delim === "\\x") {
      if (pos[0].start > 1) pos[0].start -= 2;
      else pos[0].start = 0;
      if (pos[0].end > 1) pos[0].end -= 2;
      else pos[0].end = 0;
    }

    pos[0].start = pos[0].start === 0 ? 0 : Math.round(pos[0].start / width);
    pos[0].end = pos[0].end === 0 ? 0 : Math.ceil(pos[0].end / width);
    return pos;
  }

  highlightReverse(pos: HighlightPos, args: unknown[]): HighlightResult {
    const delimStr = (args[0] as string) || "Space";
    const delim = Utils.charRep(delimStr);
    const len = delim === "\r\n" ? 1 : delim.length;

    pos[0].start = pos[0].start * (2 + len);
    pos[0].end = pos[0].end * (2 + len) - len;

    if (delim === "0x" || delim === "\\x") {
      pos[0].start += 2;
      pos[0].end += 2;
    }
    return pos;
  }
}

export default FromHex;
