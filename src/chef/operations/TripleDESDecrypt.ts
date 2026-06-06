/**
 * @fileoverview Triple DES decryption operation.
 * @license Apache-2.0
 */

import { Operation } from "../Operation";
import { OperationError } from "../errors/OperationError";
import { createDecipheriv } from "crypto";
import { fromHex } from "../lib/Hex";
import { Utils } from "../Utils";

/**
 * Triple DES applies DES three times to each data block for stronger encryption.
 *
 * Supports 16-byte (2-key) and 24-byte (3-key) keys.
 *
 * @category Ciphers
 * @see https://wikipedia.org/wiki/Triple_DES
 */
export class TripleDESDecrypt extends Operation {
  constructor() {
    super();
    this.name = "Triple DES Decrypt";
    this.module = "Ciphers";
    this.description =
      "Triple DES applies DES three times to each data block for stronger encryption.";
    this.infoURL = "https://wikipedia.org/wiki/Triple_DES";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [
      {
        name: "Key",
        type: "toggleString",
        value: "",
        toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
      },
      {
        name: "IV",
        type: "toggleString",
        value: "",
        toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
      },
      {
        name: "Mode",
        type: "option",
        value: ["CBC", "CFB", "OFB", "CTR", "ECB"],
      },
      { name: "Input", type: "option", value: ["Hex", "Raw"] },
      { name: "Output", type: "option", value: ["Raw", "Hex"] },
    ];
  }

  /**
   * Executes the Triple DES decryption.
   *
   * @param input - The data to decrypt (string or ArrayBuffer).
   * @param args - [Key, IV, Mode, InputType, OutputType]
   * @returns The decrypted data as an ArrayBuffer.
   * @throws {OperationError} If decryption fails or arguments are invalid.
   */
  run(input: string | ArrayBuffer, args: unknown[]): ArrayBuffer {
    const keyObj = args[0] as { string: string; option: string };
    const ivObj = args[1] as { string: string; option: string };
    const mode = (args[2] as string).toLowerCase();
    const inputType = args[3] as string;
    const outputType = args[4] as string;

    let keyBytes: Buffer;
    let ivBytes: Buffer;

    if (keyObj.option === "Hex") {
      keyBytes = Buffer.from(fromHex(keyObj.string));
    } else {
      keyBytes = Buffer.from(keyObj.string, "latin1");
    }
    if (ivObj.option === "Hex") {
      ivBytes = Buffer.from(fromHex(ivObj.string));
    } else {
      ivBytes = Buffer.from(ivObj.string, "latin1");
    }

    // Handle 2-key Triple DES (16 bytes) by expanding to 24 bytes (K1, K2, K1)
    if (keyBytes.length === 16) {
      keyBytes = Buffer.concat([keyBytes, keyBytes.subarray(0, 8)]);
    }

    if (keyBytes.length !== 24) {
      throw new OperationError("Key must be 16 or 24 bytes (128 or 192 bits)");
    }
    if (mode !== "ecb" && ivBytes.length !== 8) {
      throw new OperationError("IV must be 8 bytes for Triple DES");
    }

    const algMap: Record<string, string> = {
      cbc: "des-ede3-cbc",
      cfb: "des-ede3-cfb",
      ofb: "des-ede3-ofb",
      ctr: "des-ede3-ctr",
      ecb: "des-ede3-ecb",
    };
    const alg = algMap[mode] ?? "des-ede3-cbc";

    let data: Buffer;
    if (inputType === "Hex") {
      const inputStr =
        typeof input === "string"
          ? input
          : new TextDecoder().decode(input as ArrayBuffer);
      data = Buffer.from(fromHex(inputStr));
    } else {
      if (typeof input === "string") {
        data = Buffer.from(new Uint8Array(Utils.strToArrayBuffer(input)));
      } else {
        data = Buffer.from(new Uint8Array(input as ArrayBuffer));
      }
    }

    let decipher;
    try {
      decipher =
        mode === "ecb"
          ? createDecipheriv(alg, keyBytes, Buffer.alloc(0))
          : createDecipheriv(alg, keyBytes, ivBytes);
    } catch (err) {
      throw new OperationError("Decryption error: " + String(err));
    }

    let decrypted: Buffer;
    try {
      decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    } catch (err) {
      throw new OperationError("Decryption failed: " + String(err));
    }

    if (outputType === "Hex") {
      const hexStr = decrypted.toString("hex");
      return new TextEncoder().encode(hexStr).buffer as ArrayBuffer;
    }
    return decrypted.buffer.slice(
      decrypted.byteOffset,
      decrypted.byteOffset + decrypted.byteLength,
    ) as ArrayBuffer;
  }
}

export default TripleDESDecrypt;
