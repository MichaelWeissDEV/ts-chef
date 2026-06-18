/**
 * @fileoverview ToHexContent operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation } from "../Operation";

export class ToHexContent extends Operation {
  constructor() {
    super();
    this.name = "To hex content";
    this.module = "Default";
    this.description =
      "Converts the input string to hexadecimal, encoding only non-printable and non-ASCII characters.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Prefix", type: "option", value: ["\\x", "0x", "%", "\\u"] },
      { name: "Convert all chars", type: "boolean", value: false },
    ];
  }

  run(input: string, args: unknown[]): string {
    const prefix = args[0] as string;
    const convertAll = args[1] as boolean;

    return Array.from(input)
      .map((ch) => {
        const cp = ch.codePointAt(0)!;
        if (!convertAll && cp >= 0x20 && cp < 0x7f && cp !== 0x5c) {
          return ch;
        }
        if (prefix === "\\u") {
          return `\\u${cp.toString(16).padStart(4, "0")}`;
        }
        return prefix + cp.toString(16).padStart(2, "0");
      })
      .join("");
  }
}

export default ToHexContent;
