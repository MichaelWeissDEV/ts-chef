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
import { caseInsensitiveSort } from "../lib/Sort";

export class Strings extends Operation {
  constructor() {
    super();
    this.name = "Strings";
    this.module = "Regex";
    this.description = "Extracts all strings from the input.";
    this.infoURL = "https://wikipedia.org/wiki/Strings_(Unix)";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Encoding",
        type: "option",
        value: [
          "Single byte",
          "16-bit littleendian",
          "16-bit bigendian",
          "All",
        ],
      },
      { name: "Minimum length", type: "number", value: 4 },
      {
        name: "Match",
        type: "option",
        value: [
          "[ASCII]",
          "Alphanumeric + punctuation (A)",
          "All printable chars (A)",
          "Null-terminated strings (A)",
          "[Unicode]",
          "Alphanumeric + punctuation (U)",
          "All printable chars (U)",
          "Null-terminated strings (U)",
        ],
      },
      { name: "Display total", type: "boolean", value: false },
      { name: "Sort", type: "boolean", value: false },
      { name: "Unique", type: "boolean", value: false },
    ];
  }

  run(input: string, args: unknown[]): string {
    const [encoding, minLen, matchType, displayTotal, sort, unique] = args as [
      string,
      number,
      string,
      boolean,
      boolean,
      boolean,
    ];

    const alphanumeric = "A-Z\\d";
    const punctuation = "/\\-:.,_$%'\"()<>= !\\[\\]{}@";
    const printable = "\x20-\x7e";

    let strings = "";
    switch (matchType) {
      case "Alphanumeric + punctuation (A)":
        strings = `[${alphanumeric + punctuation}]`;
        break;
      case "All printable chars (A)":
      case "Null-terminated strings (A)":
        strings = `[${printable}]`;
        break;
      case "Alphanumeric + punctuation (U)":
        strings = "[\\p{L}\\p{N}\\p{P}\\p{Z}]";
        break;
      case "All printable chars (U)":
      case "Null-terminated strings (U)":
        strings = "[\\p{L}\\p{M}\\p{Z}\\p{S}\\p{N}\\p{P}]";
        break;
      default:
        strings = `[${printable}]`;
    }

    switch (encoding) {
      case "All":
        strings = `(\x00?${strings}\x00?)`;
        break;
      case "16-bit littleendian":
        strings = `(${strings}\x00)`;
        break;
      case "16-bit bigendian":
        strings = `(\x00${strings})`;
        break;
      default:
        break;
    }

    strings = `${strings}{${minLen},}`;

    if (matchType.includes("Null-terminated")) {
      strings += "\x00";
    }

    const flags = matchType.includes("(U)") ? "giu" : "gi";
    const regex = new RegExp(strings, flags);
    let results: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(input)) !== null) {
      if (match.index === regex.lastIndex) regex.lastIndex++;
      results.push(match[0]);
    }

    if (sort) results = results.sort(caseInsensitiveSort);
    if (unique) results = [...new Set(results)];

    const joined = results.join("\n");
    return displayTotal
      ? `Total found: ${results.length}\n\n${joined}`
      : joined;
  }
}

export default Strings;
