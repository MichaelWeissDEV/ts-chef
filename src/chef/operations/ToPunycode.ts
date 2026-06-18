/**
 * @fileoverview ToPunycode operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
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
