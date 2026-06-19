/**
 * @fileoverview HTMLToText operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";

export class HTMLToText extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "HTML To Text";
    this.module = "Default";
    this.description =
      "Converts an HTML output from an operation to a readable string instead of being rendered in the DOM.";
    this.infoURL = "";
    this.inputType = "html";
    this.outputType = "string";
    this.args = [];
  }

  run(input: string, _args: unknown[]): string {
    return input;
  }
}

export default HTMLToText;
