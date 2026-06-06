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

const DELIM_OPTIONS = [
  "Space",
  "Percent",
  "Comma",
  "Semi-colon",
  "Colon",
  "Line feed",
  "CRLF",
  "0x",
  "0x with comma",
  "\\x",
  "None",
];

export class ToHex extends Operation {
  constructor() {
    super();
    this.name = "To hex";
    this.module = "Default";
    this.description =
      "Converts the input string to hexadecimal bytes separated by the specified delimiter.";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      { name: "Delimiter", type: "option", value: DELIM_OPTIONS },
      { name: "Bytes per line", type: "number", value: 0 },
    ];
  }

  run(input: ArrayBuffer, args: unknown[]): string {
    const delimOpt = args[0] as string;
    const bytesPerLine = args[1] as number;
    const bytes = new Uint8Array(input);

    const delimMap: Record<string, string> = {
      Space: " ",
      Percent: "%",
      Comma: ",",
      "Semi-colon": ";",
      Colon: ":",
      "Line feed": "\n",
      CRLF: "\r\n",
      "0x": "",
      "0x with comma": ",",
      "\\x": "",
      None: "",
    };

    const prefixMap: Record<string, string> = {
      "0x": "0x",
      "0x with comma": "0x",
      "\\x": "\\x",
    };

    const delim = delimMap[delimOpt] ?? " ";
    const prefix = prefixMap[delimOpt] ?? "";

    const hexBytes = Array.from(bytes).map(
      (b) => prefix + b.toString(16).padStart(2, "0"),
    );

    if (bytesPerLine > 0) {
      const lines: string[] = [];
      for (let i = 0; i < hexBytes.length; i += bytesPerLine) {
        lines.push(hexBytes.slice(i, i + bytesPerLine).join(delim));
      }
      return lines.join("\n");
    }

    return hexBytes.join(delim);
  }
}

export default ToHex;
