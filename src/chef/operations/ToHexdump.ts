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

export class ToHexdump extends Operation {
  constructor() {
    super();
    this.name = "To hexdump";
    this.module = "Default";
    this.description =
      "Creates a hex dump of the input data, similar to the xxd or hexdump commands.";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      { name: "Width", type: "number", value: 16 },
      { name: "Upper case hex", type: "boolean", value: false },
      { name: "Include final length", type: "boolean", value: false },
    ];
  }

  run(input: ArrayBuffer, args: unknown[]): string {
    const width = (args[0] as number) || 16;
    const upperCase = args[1] as boolean;
    const includeFinalLen = args[2] as boolean;
    const bytes = new Uint8Array(input);
    const lines: string[] = [];

    const toHex = (b: number) => {
      const h = b.toString(16).padStart(2, "0");
      return upperCase ? h.toUpperCase() : h;
    };

    for (let i = 0; i < bytes.length; i += width) {
      const chunk = bytes.slice(i, i + width);
      const offset = i.toString(16).padStart(8, "0");
      const hexPart = Array.from(chunk)
        .map(toHex)
        .join(" ")
        .padEnd(width * 3 - 1, " ");
      const charPart = Array.from(chunk)
        .map((b) => (b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : "."))
        .join("");
      lines.push(`${offset}  ${hexPart}  |${charPart}|`);
    }

    if (includeFinalLen) {
      lines.push(bytes.length.toString(16).padStart(8, "0"));
    }

    return lines.join("\n");
  }
}

export default ToHexdump;
