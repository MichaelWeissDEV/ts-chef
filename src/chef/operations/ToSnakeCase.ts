/**
 * @fileoverview ToSnakeCase operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";

export class ToSnakeCase extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "To snake case";
    this.module = "Default";
    this.description = "Converts the input string to snake_case format.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Attempt to be intelligent", type: "boolean", value: false },
    ];
  }

  run(input: string, _args: unknown[]): string {
    return input
      .replace(/([A-Z])/g, "_$1")
      .replace(/[\s-]+/g, "_")
      .replace(/^_/, "")
      .replace(/_{2,}/g, "_")
      .toLowerCase();
  }
}

export default ToSnakeCase;
