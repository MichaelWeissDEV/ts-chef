/**
 * @fileoverview FileTree operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import Utils from "../Utils";
import { INPUT_DELIM_OPTIONS } from "../lib/Delim";

/**
 * Unique operation
 */
export class FileTree extends TypedOperation<string, AnyInput, unknown[]> {
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
  run(input: string, args: unknown[]): AnyInput {
    const [arg0, arg1] = args as [string, string];
    // Set up arrow and pipe for nice output display
    const ARROW = "|---";
    const PIPE = "|   ";

    // Get args from input
    const fileDelim = arg0;
    const entryDelim = Utils.charRep(arg1);

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
