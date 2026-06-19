/**
 * @fileoverview URLEncode operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";

export class URLEncode extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "URL encode";
    this.module = "URL";
    this.description =
      "Encodes problematic characters into percent-encoded URL safe format.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Encode all special chars", type: "boolean", value: false },
    ];
  }

  run(input: string, args: unknown[]): string {
    const encodeAll = args[0] as boolean;
    if (encodeAll) {
      return Array.from(input)
        .map((ch) => {
          const cp = ch.codePointAt(0)!;
          return "%" + cp.toString(16).toUpperCase().padStart(2, "0");
        })
        .join("");
    }
    return encodeURIComponent(input).replace(/%20/g, "+");
  }
}

export default URLEncode;
