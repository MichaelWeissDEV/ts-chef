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

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ssdeepjs = require("ssdeep.js");
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
