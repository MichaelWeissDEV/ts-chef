/**
 * @fileoverview Label operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";

export class Label extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "Label";
    this.module = "Default";
    this.description =
      "Provides a location for conditional and fixed jumps to redirect execution to.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Name",
        type: "shortString",
        value: "",
      },
    ];
  }

  run(input: string, _args: unknown[]): string {
    return input;
  }
}

export default Label;
