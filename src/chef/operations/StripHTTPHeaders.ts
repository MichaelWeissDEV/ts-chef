/**
 * @fileoverview StripHTTPHeaders operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";

export class StripHTTPHeaders extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "Strip HTTP headers";
    this.module = "Default";
    this.description =
      "Removes HTTP headers from a request or response by looking for the first instance of a double newline.";
    this.infoURL =
      "https://wikipedia.org/wiki/Hypertext_Transfer_Protocol#Message_format";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  run(input: string, _args: unknown[]): string {
    let headerEnd = input.indexOf("\r\n\r\n");
    headerEnd = headerEnd < 0 ? input.indexOf("\n\n") + 2 : headerEnd + 4;
    return headerEnd < 2 ? input : input.slice(headerEnd);
  }
}

export default StripHTTPHeaders;
