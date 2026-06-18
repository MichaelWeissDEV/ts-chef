/**
 * @fileoverview RemoveLineNumbers operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation } from "../Operation";

export class RemoveLineNumbers extends Operation {
  constructor() {
    super();
    this.name = "Remove line numbers";
    this.module = "Default";
    this.description =
      "Removes line numbers from the output if they can be trivially detected.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  run(input: string, _args: unknown[]): string {
    return input.replace(/^[ \t]{0,5}\d+[\s:|\-,.)\]]/gm, "");
  }
}

export default RemoveLineNumbers;
