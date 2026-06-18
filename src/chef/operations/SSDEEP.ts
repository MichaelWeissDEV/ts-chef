/**
 * @fileoverview SSDEEP operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import * as ssdeepjs from "ssdeep.js";
import { Operation } from "../Operation";

export class SSDEEP extends Operation {
  constructor() {
    super();
    this.name = "SSDEEP";
    this.module = "Crypto";
    this.description =
      "SSDEEP is a program for computing context triggered piecewise hashes (CTPH), also called fuzzy hashes.";
    this.infoURL = "https://forensics.wiki/ssdeep";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  run(input: string, _args: unknown[]): string {
    return ssdeepjs.digest(input) as string;
  }
}

export default SSDEEP;
