/**
 * @fileoverview ToKebabCase operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";

export class ToKebabCase extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "To kebab case";
    this.module = "Default";
    this.description = "Converts the input string to kebab-case format.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Attempt to be intelligent", type: "boolean", value: false },
    ];
  }

  run(input: string, _args: unknown[]): string {
    return input
      .replace(/([A-Z])/g, "-$1")
      .replace(/[\s_]+/g, "-")
      .replace(/^-/, "")
      .replace(/-{2,}/g, "-")
      .toLowerCase();
  }
}

export default ToKebabCase;
