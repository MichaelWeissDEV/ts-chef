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

import * as JSSHA3 from "js-sha3";
import { Operation } from "../Operation";
import { OperationError } from "../errors/OperationError";

export class SHA3 extends Operation {
  constructor() {
    super();
    this.name = "SHA3";
    this.module = "Crypto";
    this.description =
      "The SHA-3 (Secure Hash Algorithm 3) hash functions were released by NIST on August 5, 2015. Although part of the same series of standards, SHA-3 is internally quite different from the MD5-like structure of SHA-1 and SHA-2.";
    this.infoURL = "https://wikipedia.org/wiki/SHA-3";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      { name: "Size", type: "option", value: ["512", "384", "256", "224"] },
    ];
  }

  run(input: ArrayBuffer, args: unknown[]): string {
    const size = parseInt(args[0] as string, 10);
    const buf = Buffer.from(input);
    switch (size) {
      case 224:
        return JSSHA3.sha3_224(buf);
      case 256:
        return JSSHA3.sha3_256(buf);
      case 384:
        return JSSHA3.sha3_384(buf);
      case 512:
        return JSSHA3.sha3_512(buf);
      default:
        throw new OperationError("Invalid size");
    }
  }
}

export default SHA3;
