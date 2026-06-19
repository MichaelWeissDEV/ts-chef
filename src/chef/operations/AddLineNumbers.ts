/**
 * @fileoverview AddLineNumbers operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";

/**
 * Add line numbers operation
 *
 * @category Utils
 */
export class AddLineNumbers extends TypedOperation<string, string, number[]> {
  /**
   * AddLineNumbers constructor
   */
  constructor() {
    super();
    this.name = "Add line numbers";
    this.module = "Default";
    this.description = "Adds line numbers to the output.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Offset",
        type: "number",
        value: 0,
      },
    ];
  }

  /**
   * Runs the operation.
   *
   * @param {string} input - The input string.
   * @param {number[]} args - Operation arguments.
   * @param {number} args[0] - The starting line number offset.
   * @returns {string} - The input string with line numbers added.
   *
   * @see {@link RemoveLineNumbers}
   */
  run(input: string, args: number[]): string {
    const lines = input.split("\n");
    const width = lines.length.toString().length;
    const offset = args[0] ? parseInt(String(args[0]), 10) : 0;
    const output: string[] = [];

    for (let n = 0; n < lines.length; n++) {
      output.push(
        (n + 1 + offset).toString().padStart(width, " ") + " " + lines[n],
      );
    }
    return output.join("\n");
  }
}

export default AddLineNumbers;
