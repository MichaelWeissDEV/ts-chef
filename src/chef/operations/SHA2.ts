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
import { OperationError } from "../errors/OperationError";

const SIZE_MAP: Record<string, string> = {
  "512": "sha512",
  "384": "sha384",
  "256": "sha256",
  "224": "sha224",
  "512/256": "sha512-256",
  "512/224": "sha512-224",
};

export class SHA2 extends Operation {
  constructor() {
    super();
    this.name = "SHA2";
    this.module = "Crypto";
    this.description =
      "The SHA-2 (Secure Hash Algorithm 2) hash functions were designed by the NSA. The family consists of hash functions with digests of 224, 256, 384, or 512 bits.";
    this.infoURL = "https://wikipedia.org/wiki/SHA-2";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      {
        name: "Size",
        type: "option",
        value: ["512", "384", "256", "224", "512/256", "512/224"],
      },
    ];
  }

  run(input: ArrayBuffer, args: unknown[]): string {
    const size = args[0] as string;
    const algo = SIZE_MAP[size];
    if (!algo) throw new OperationError(`Invalid size: ${size}`);
    return createHash(algo).update(Buffer.from(input)).digest("hex");
  }
}

export default SHA2;
