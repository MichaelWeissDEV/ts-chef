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

export class SM2Decrypt extends Operation {
  constructor() {
    super();
    this.name = "SM2 Decrypt";
    this.module = "Crypto";
    this.description = "Decrypts a message utilizing the SM2 standard.";
    this.inputType = "string";
    this.outputType = "ArrayBuffer";
    this.args = [
      { name: "Private Key", type: "string", value: "DEADBEEF" },
      {
        name: "Input Format",
        type: "option",
        value: ["C1C3C2", "C1C2C3"],
        defaultIndex: 0,
      },
      { name: "Curve", type: "option", value: ["sm2p256v1"], defaultIndex: 0 },
    ];
  }

  run(input: string, args: unknown[]): ArrayBuffer {
    const [privateKey, inputFormat, curveName] = args as string[];
    if (privateKey.length !== 64) {
      throw new OperationError(
        "Input private key must be in hex; and should be 32 bytes",
      );
    }
    const sm2 = new SM2(curveName, inputFormat);
    sm2.setPrivateKey(privateKey);
    return sm2.decrypt(input);
  }
}

export default SM2Decrypt;
