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
import { SM2 } from "../lib/SM2";

export class SM2Encrypt extends Operation {
  constructor() {
    super();
    this.name = "SM2 Encrypt";
    this.module = "Crypto";
    this.description = "Encrypts a message utilizing the SM2 standard.";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      { name: "Public Key X", type: "string", value: "DEADBEEF" },
      { name: "Public Key Y", type: "string", value: "DEADBEEF" },
      {
        name: "Output Format",
        type: "option",
        value: ["C1C3C2", "C1C2C3"],
        defaultIndex: 0,
      },
      { name: "Curve", type: "option", value: ["sm2p256v1"], defaultIndex: 0 },
    ];
  }

  run(input: ArrayBuffer, args: unknown[]): string {
    const [publicKeyX, publicKeyY, outputFormat, curveName] = args as string[];
    if (publicKeyX.length !== 64 || publicKeyY.length !== 64) {
      throw new OperationError(
        "Invalid Public Key - Ensure each component is 32 bytes in size and in hex",
      );
    }
    const sm2 = new SM2(curveName, outputFormat);
    sm2.setPublicKey(publicKeyX, publicKeyY);
    return sm2.encrypt(new Uint8Array(input));
  }
}

export default SM2Encrypt;
