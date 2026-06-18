/**
 * @fileoverview ToHTMLEntity operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation } from "../Operation";

const NAMED_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
  " ": "&nbsp;",
  "©": "&copy;",
  "®": "&reg;",
  "™": "&trade;",
};

export class ToHTMLEntity extends Operation {
  constructor() {
    super();
    this.name = "To HTML entity";
    this.module = "Default";
    this.description =
      "Converts characters to their HTML entity equivalents (decimal, hexadecimal, or named where available).";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Convert all characters", type: "boolean", value: false },
      {
        name: "Format",
        type: "option",
        value: [
          "Named entities where possible, otherwise decimal",
          "Named entities where possible, otherwise hex",
          "Decimal",
          "Hex",
        ],
      },
    ];
  }

  run(input: string, args: unknown[]): string {
    const convertAll = args[0] as boolean;
    const format = args[1] as string;

    return Array.from(input)
      .map((ch) => {
        const cp = ch.codePointAt(0)!;
        if (
          !convertAll &&
          cp < 128 &&
          cp !== 38 &&
          cp !== 60 &&
          cp !== 62 &&
          cp !== 34 &&
          cp !== 39
        ) {
          return ch;
        }
        if (format.startsWith("Named") && NAMED_ENTITIES[ch]) {
          return NAMED_ENTITIES[ch];
        }
        if (format.includes("decimal") || format === "Decimal") {
          return `&#${cp};`;
        }
        return `&#x${cp.toString(16)};`;
      })
      .join("");
  }
}

export default ToHTMLEntity;
