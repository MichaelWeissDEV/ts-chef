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
import { Utils } from "../Utils";

interface ToggleStringArg {
  string: string;
  option: string;
}

export class FindReplace extends Operation {
  constructor() {
    super();
    this.name = "Find / Replace";
    this.module = "Regex";
    this.description =
      "Replaces all occurrences of the first string with the second. Includes support for regular expressions (regex), simple strings and extended strings.";
    this.infoURL = "https://wikipedia.org/wiki/Regular_expression";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Find",
        type: "toggleString",
        value: "",
        toggleValues: ["Regex", "Extended (\\n, \\t, \\x...)", "Simple string"],
      },
      {
        name: "Replace",
        type: "binaryString",
        value: "",
      },
      {
        name: "Global match",
        type: "boolean",
        value: true,
      },
      {
        name: "Case insensitive",
        type: "boolean",
        value: false,
      },
      {
        name: "Multiline matching",
        type: "boolean",
        value: true,
      },
      {
        name: "Dot matches all",
        type: "boolean",
        value: false,
      },
    ];
  }

  run(input: string, args: unknown[]): string {
    const findArg = args[0] as ToggleStringArg;
    const replace = args[1] as string;
    const g = args[2] as boolean;
    const i = args[3] as boolean;
    const m = args[4] as boolean;
    const s = args[5] as boolean;

    let find = findArg.string;
    const type = findArg.option;
    let modifiers = "";

    if (g) modifiers += "g";
    if (i) modifiers += "i";
    if (m) modifiers += "m";
    if (s) modifiers += "s";

    if (type === "Regex") {
      return input.replace(new RegExp(find, modifiers), replace);
    }

    if (type.indexOf("Extended") === 0) {
      find = Utils.parseEscapedChars(find);
    }

    return input.replace(
      new RegExp(Utils.escapeRegex(find), modifiers),
      replace,
    );
  }
}

export default FindReplace;
