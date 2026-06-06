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

import { createHash } from "crypto";
import { Operation } from "../Operation";

export class SHA1 extends Operation {
  constructor() {
    super();
    this.name = "SHA1";
    this.module = "Crypto";
    this.description =
      "The SHA (Secure Hash Algorithm) hash functions were designed by the NSA. SHA-1 is the most established of the existing SHA hash functions and is used in a variety of security applications and protocols.";
    this.infoURL = "https://wikipedia.org/wiki/SHA-1";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [{ name: "Rounds", type: "number", value: 80, min: 16 }];
  }

  run(input: ArrayBuffer, _args: unknown[]): string {
    return createHash("sha1").update(Buffer.from(input)).digest("hex");
  }
}

export default SHA1;
