/**
 * @fileoverview ToHex operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";

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

export class ToHex extends TypedOperation<ArrayBuffer, string, unknown[]> {
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
