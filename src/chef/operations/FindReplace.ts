/**
 * @fileoverview FindReplace operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";
import { Utils } from "../Utils";

interface ToggleStringArg {
  string: string;
  option: string;
}

export class FindReplace extends TypedOperation<string, string, unknown[]> {
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
