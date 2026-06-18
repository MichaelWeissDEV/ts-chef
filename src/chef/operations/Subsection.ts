/**
 * @fileoverview Subsection operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation } from "../Operation";

export class Subsection extends Operation {
  constructor() {
    super();
    this.name = "Subsection";
    this.flowControl = true;
    this.module = "Default";
    this.description =
      "Select a part of the input data using a regular expression, and run all subsequent operations on each match separately.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Section (regex)", type: "string", value: "" },
      { name: "Case sensitive matching", type: "boolean", value: true },
      { name: "Global matching", type: "boolean", value: true },
      { name: "Ignore errors", type: "boolean", value: false },
    ];
  }

  run(input: string, _args: unknown[]): string {
    return input;
  }
}

export default Subsection;
