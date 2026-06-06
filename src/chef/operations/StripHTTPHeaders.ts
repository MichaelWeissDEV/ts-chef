/*
 * -----------------------------------------------------------------------------
 * Project:     ts-chef
 * Model:       Qwen 3.5 Coder Next (Local)
 * Version:     1.0.0
 * Author:      Michael Weiss
 * Source:      Ported from GCHQ's CyberChef (JavaScript)
 * License:     Apache License 2.0
 * Description: TypeScript implementation of CyberChef modules.
 * Note:        First Port done by Local Model, Cleanup and fixes by Author
 * -----------------------------------------------------------------------------
 */

import { Operation } from "../Operation";

export class StripHTTPHeaders extends Operation {
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
