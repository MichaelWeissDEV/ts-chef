/**
 * @fileoverview URLDecode operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation } from "../Operation";

export class URLDecode extends Operation {
  constructor() {
    super();
    this.name = "URL decode";
    this.module = "URL";
    this.description =
      "Converts URI/URL percent-encoded characters back to their raw values.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  run(input: string, _args: unknown[]): string {
    return decodeURIComponent(input.replace(/\+/g, " "));
  }
}

export default URLDecode;
