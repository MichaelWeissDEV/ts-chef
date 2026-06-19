/**
 * @fileoverview SHA1 operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { createHash } from "crypto";
import { TypedOperation } from "../Operation_new";

export class SHA1 extends TypedOperation<ArrayBuffer, string, unknown[]> {
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
