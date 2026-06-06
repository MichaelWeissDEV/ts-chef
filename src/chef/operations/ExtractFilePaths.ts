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
import { search } from "../lib/Extract";
import { caseInsensitiveSort } from "../lib/Sort";

/**
 * Extract file paths operation
 */
export class ExtractFilePaths extends Operation {
  /**
   * ExtractFilePaths constructor
   */
  constructor() {
    super();

    this.name = "Extract file paths";
    this.module = "Regex";
    this.description =
      "Extracts anything that looks like a Windows or UNIX file path.<br><br>Note that if UNIX is selected, there will likely be a lot of false positives.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Windows",
        type: "boolean",
        value: true,
      },
      {
        name: "UNIX",
        type: "boolean",
        value: true,
      },
      {
        name: "Display total",
        type: "boolean",
        value: false,
      },
      {
        name: "Sort",
        type: "boolean",
        value: false,
      },
      {
        name: "Unique",
        type: "boolean",
        value: false,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const [includeWinPath, includeUnixPath, displayTotal, sort, unique] = args,
      winDrive = "[A-Z]:\\\\",
      winName = "[A-Z\\d][A-Z\\d\\- '_\\(\\)~]{0,61}",
      winExt = "[A-Z\\d]{1,6}",
      winPath =
        winDrive +
        "(?:" +
        winName +
        "\\\\?)*" +
        winName +
        "(?:\\." +
        winExt +
        ")?",
      unixPath = "(?:/[A-Z\\d.][A-Z\\d\\-.]{0,61})+";
    let filePaths = "";

    if (includeWinPath && includeUnixPath) {
      filePaths = winPath + "|" + unixPath;
    } else if (includeWinPath) {
      filePaths = winPath;
    } else if (includeUnixPath) {
      filePaths = unixPath;
    }

    if (!filePaths) {
      return "";
    }

    const regex = new RegExp(filePaths, "ig");
    const results = search(
      input,
      regex,
      null,
      sort ? caseInsensitiveSort : null,
      unique,
    );

    if (displayTotal) {
      return `Total found: ${results.length}\n\n${results.join("\n")}`;
    } else {
      return results.join("\n");
    }
  }
}

export default ExtractFilePaths;
