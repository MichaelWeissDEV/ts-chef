/**
 * @fileoverview ToUpperCase operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";

export class ToUpperCase extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "To upper case";
    this.module = "Default";
    this.description = "Converts the input string to upper case.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  run(input: string, _args: unknown[]): string {
    return input.toUpperCase();
  }
}

export default ToUpperCase;
