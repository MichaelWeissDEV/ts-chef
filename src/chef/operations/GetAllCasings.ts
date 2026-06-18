/**
 * @fileoverview GetAllCasings operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation } from "../Operation";

export class GetAllCasings extends Operation {
  constructor() {
    super();
    this.name = "Get All Casings";
    this.module = "Default";
    this.description = "Outputs all possible casing variations of a string.";
    this.infoURL = "";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  run(input: string, _args: unknown[]): string {
    const length = input.length;
    const max = 1 << length;
    const lower = input.toLowerCase();
    const lines: string[] = [];

    for (let i = 0; i < max; i++) {
      const chars = lower.split("");
      for (let j = 0; j < length; j++) {
        if (((i >> j) & 1) === 1) {
          chars[j] = chars[j].toUpperCase();
        }
      }
      lines.push(chars.join(""));
    }
    return lines.join("\n");
  }
}

export default GetAllCasings;
