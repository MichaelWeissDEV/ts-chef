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
import { OperationError } from "../errors/OperationError";

export class ToPunycode extends Operation {
  constructor() {
    super();
    this.name = "To Punycode";
    this.module = "Default";
    this.description =
      "Encodes a Unicode domain name to its Punycode ASCII representation (xn-- prefix).";
    this.infoURL = "https://wikipedia.org/wiki/Punycode";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  run(input: string, _args: unknown[]): string {
    try {
      const url = new URL("http://" + input.trim());
      return url.hostname;
    } catch {
      throw new OperationError("Invalid domain name: " + input.trim());
    }
  }
}

export default ToPunycode;
