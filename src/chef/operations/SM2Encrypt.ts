/**
 * @fileoverview SM2Encrypt operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import { OperationError } from "../errors/OperationError";
import { SM2 } from "../lib/SM2";

export class SM2Encrypt extends TypedOperation<ArrayBuffer, string, unknown[]> {
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
