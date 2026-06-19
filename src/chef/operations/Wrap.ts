/**
 * @fileoverview Wrap operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";

export class Wrap extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "Wrap";
    this.module = "Default";
    this.description =
      "Wraps each line of the input to the specified line length.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Line length", type: "number", value: 80 },
      { name: "Break on words", type: "boolean", value: false },
      { name: "Line delimiter", type: "option", value: ["Line feed", "CRLF"] },
    ];
  }

  run(input: string, args: unknown[]): string {
    const lineLen = args[0] as number;
    const breakOnWords = args[1] as boolean;
    const lineDelimOpt = args[2] as string;
    const lineDelim = lineDelimOpt === "CRLF" ? "\r\n" : "\n";

    if (lineLen <= 0) return input;

    const lines = input.split(/\r?\n/);
    const result: string[] = [];

    for (const line of lines) {
      if (line.length <= lineLen) {
        result.push(line);
        continue;
      }
      if (!breakOnWords) {
        for (let i = 0; i < line.length; i += lineLen) {
          result.push(line.slice(i, i + lineLen));
        }
      } else {
        const words = line.split(" ");
        let current = "";
        for (const word of words) {
          if (current.length === 0) {
            current = word;
          } else if (current.length + 1 + word.length <= lineLen) {
            current += " " + word;
          } else {
            result.push(current);
            current = word;
          }
        }
        if (current) result.push(current);
      }
    }

    return result.join(lineDelim);
  }
}

export default Wrap;
