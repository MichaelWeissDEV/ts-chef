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

import Operation from "../Operation";
import Utils from "../Utils";
import { toHexFast } from "../lib/Hex";
import forge from "node-forge";
import OperationError from "../errors/OperationError";

/**
 * AES Key Unwrap operation
 */
export class AESKeyUnwrap extends Operation {
  /**
   * AESKeyUnwrap constructor
   */
  constructor() {
    super();

    this.name = "AES Key Unwrap";
    this.module = "Ciphers";
    this.description =
      "Decryptor for a key wrapping algorithm defined in RFC3394, which is used to protect keys in untrusted storage or communications, using AES.<br><br>This algorithm uses an AES key (KEK: key-encryption key) and a 64-bit IV to decrypt 64-bit blocks.";
    this.infoURL = "https://wikipedia.org/wiki/Key_wrap";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Key (KEK)",
        type: "toggleString",
        value: "",
        toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
      },
      {
        name: "IV",
        type: "toggleString",
        value: "a6a6a6a6a6a6a6a6",
        toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
      },
      {
        name: "Input",
        type: "option",
        value: ["Hex", "Raw"],
      },
      {
        name: "Output",
        type: "option",
        value: ["Hex", "Raw"],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {any[]} args
   * @returns {string}
   */
  run(input: string, args: any[]): string {
    const kek = Utils.convertToByteString(args[0].string, args[0].option),
      iv = Utils.convertToByteString(args[1].string, args[1].option),
      inputType = args[2],
      outputType = args[3];

    if (kek.length !== 16 && kek.length !== 24 && kek.length !== 32) {
      throw new OperationError(
        "KEK must be either 16, 24, or 32 bytes (currently " +
          kek.length +
          " bytes)",
      );
    }
    if (iv.length !== 8) {
      throw new OperationError(
        "IV must be 8 bytes (currently " + iv.length + " bytes)",
      );
    }
    const inputData = Utils.convertToByteString(input, inputType);
    if (inputData.length % 8 !== 0 || inputData.length < 24) {
      throw new OperationError(
        "input must be 8n (n>=3) bytes (currently " +
          inputData.length +
          " bytes)",
      );
    }

    const cipher = forge.cipher.createCipher("AES-ECB", kek);
    cipher.start();
    cipher.update(forge.util.createBuffer(""));
    cipher.finish();
    const paddingBlock = cipher.output.getBytes();

    const decipher = forge.cipher.createDecipher("AES-ECB", kek);

    let A = inputData.substring(0, 8);
    const R: string[] = [];
    for (let i = 8; i < inputData.length; i += 8) {
      R.push(inputData.substring(i, i + 8));
    }
    let cntLower = R.length >>> 0;
    let cntUpper = (R.length / ((1 << 30) * 4)) >>> 0;
    cntUpper =
      (cntUpper * 6 + (((cntLower * 6) / ((1 << 30) * 4)) >>> 0)) >>> 0;
    cntLower = (cntLower * 6) >>> 0;
    for (let j = 5; j >= 0; j--) {
      for (let i = R.length - 1; i >= 0; i--) {
        const aBuffer = Utils.strToArrayBuffer(A);
        const aView = new DataView(aBuffer);
        aView.setUint32(0, (aView.getUint32(0) ^ cntUpper) >>> 0);
        aView.setUint32(4, (aView.getUint32(4) ^ cntLower) >>> 0);
        A = Utils.arrayBufferToStr(aBuffer, false);
        decipher.start();
        decipher.update(forge.util.createBuffer(A + R[i] + paddingBlock));
        decipher.finish();
        const B = decipher.output.getBytes();
        A = B.substring(0, 8);
        R[i] = B.substring(8, 16);
        cntLower--;
        if (cntLower < 0) {
          cntUpper--;
          cntLower = 0xffffffff;
        }
      }
    }
    if (A !== iv) {
      throw new OperationError("IV mismatch");
    }
    const P = R.join("");

    if (outputType === "Hex") {
      return toHexFast(Utils.strToArrayBuffer(P));
    }
    return P;
  }
}

export default AESKeyUnwrap;
