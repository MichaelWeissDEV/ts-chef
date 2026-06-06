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
import Utils from "../Utils";
import { INPUT_DELIM_OPTIONS } from "../lib/Delim";

/**
 * Unique operation
 */
export class FileTree extends Operation {
  /**
   * Unique constructor
   */
  constructor() {
    super();

    this.name = "File Tree";
    this.module = "Default";
    this.description =
      "Creates a file tree from a list of file paths (similar to the tree command in Linux)";
    this.infoURL = "https://wikipedia.org/wiki/Tree_(command)";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "File Path Delimiter",
        type: "binaryString",
        value: "/",
      },
      {
        name: "Delimiter",
        type: "option",
        value: INPUT_DELIM_OPTIONS,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    // Set up arrow and pipe for nice output display
    const ARROW = "|---";
    const PIPE = "|   ";

    // Get args from input
    const fileDelim = args[0];
    const entryDelim = Utils.charRep(args[1]);

    // Store path to print
    const completedList: unknown[] = [];
    const printList = [];

    // Loop through all entries
    const filePaths = (
      Array.from(new Set(input.split(entryDelim))) as string[]
    ).sort();
    for (let i = 0; i < filePaths.length; i++) {
      // Split by file delimiter
      let path = filePaths[i].split(fileDelim);

      if (path[0] === "") {
        path = path.slice(1, path.length);
      }

      for (let j = 0; j < path.length; j++) {
        let printLine;
        let key;
        if (j === 0) {
          printLine = path[j];
          key = path[j];
        } else {
          printLine = PIPE.repeat(j - 1) + ARROW + path[j];
          key = path.slice(0, j + 1).join("/");
        }

        // Check to see we have already added that path
        if (!completedList.includes(key)) {
          completedList.push(key);
          printList.push(printLine);
        }
      }
    }
    return printList.join("\n");
  }
}

export default FileTree;
