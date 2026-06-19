/**
 * @fileoverview UnicodeTextFormat operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";

const FORMAT_MAP: Record<string, [number, number]> = {
  Bold: [0x1d400, 0x1d41a],
  Italic: [0x1d434, 0x1d44e],
  "Bold Italic": [0x1d468, 0x1d482],
  Script: [0x1d49c, 0x1d4b6],
  Fraktur: [0x1d504, 0x1d51e],
  "Double-struck": [0x1d538, 0x1d552],
  "Sans-serif": [0x1d5a0, 0x1d5ba],
  "Sans-serif Bold": [0x1d5d4, 0x1d5ee],
  "Sans-serif Italic": [0x1d608, 0x1d622],
  "Sans-serif Bold Italic": [0x1d63c, 0x1d656],
  Monospace: [0x1d670, 0x1d68a],
};

export class UnicodeTextFormat extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "Unicode Text Format";
    this.module = "Default";
    this.description =
      "Formats text using Unicode lookalike characters (bold, italic, etc).";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Format", type: "option", value: Object.keys(FORMAT_MAP) },
    ];
  }

  run(input: string, args: unknown[]): string {
    const format = args[0] as string;
    const [upperStart, lowerStart] = FORMAT_MAP[format] ?? FORMAT_MAP["Bold"];
    return Array.from(input)
      .map((ch) => {
        const cp = ch.codePointAt(0)!;
        if (cp >= 65 && cp <= 90)
          return String.fromCodePoint(upperStart + (cp - 65));
        if (cp >= 97 && cp <= 122)
          return String.fromCodePoint(lowerStart + (cp - 97));
        return ch;
      })
      .join("");
  }
}

export default UnicodeTextFormat;
