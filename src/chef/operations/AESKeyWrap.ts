/**
 * @fileoverview AESKeyWrap operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";
import Utils from "../Utils";
import { toHexFast } from "../lib/Hex";
import forge from "node-forge";
import OperationError from "../errors/OperationError";

/**
 * AES Key Wrap operation
 */
interface ToggleStringArg {
  string: string;
  option: string;
}

export class AESKeyWrap extends TypedOperation<string, string, unknown[]> {
  /**
   * AESKeyWrap constructor
   */
  constructor() {
    super();

    this.name = "AES Key Wrap";
    this.module = "Ciphers";
    this.description =
      "A key wrapping algorithm defined in RFC3394, which is used to protect keys in untrusted storage or communications, using AES.<br><br>This algorithm uses an AES key (KEK: key-encryption key) and a 64-bit IV to decrypt 64-bit blocks.";
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
  run(input: string, args: unknown[]): string {
    const [kekArg, ivArg, inputType, outputType] = args as [
      ToggleStringArg,
      ToggleStringArg,
      string,
      string,
    ];
    const kek = Utils.convertToByteString(kekArg.string, kekArg.option),
      iv = Utils.convertToByteString(ivArg.string, ivArg.option);

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
    if (inputData.length % 8 !== 0 || inputData.length < 16) {
      throw new OperationError(
        "input must be 8n (n>=2) bytes (currently " +
          inputData.length +
          " bytes)",
      );
    }

    const cipher = forge.cipher.createCipher("AES-ECB", kek);

    let A = iv;
    const R: string[] = [];
    for (let i = 0; i < inputData.length; i += 8) {
      R.push(inputData.substring(i, i + 8));
    }
    let cntLower = 1,
      cntUpper = 0;
    for (let j = 0; j < 6; j++) {
      for (let i = 0; i < R.length; i++) {
        cipher.start();
        cipher.update(forge.util.createBuffer(A + R[i]));
        cipher.finish();
        const B = cipher.output.getBytes();
        const msbBuffer = Utils.strToArrayBuffer(B.substring(0, 8));
        const msbView = new DataView(msbBuffer);
        msbView.setUint32(0, (msbView.getUint32(0) ^ cntUpper) >>> 0);
        msbView.setUint32(4, (msbView.getUint32(4) ^ cntLower) >>> 0);
        A = Utils.arrayBufferToStr(msbBuffer, false);
        R[i] = B.substring(8, 16);
        cntLower++;
        if (cntLower > 0xffffffff) {
          cntUpper++;
          cntLower = 0;
        }
      }
    }
    const C = A + R.join("");

    if (outputType === "Hex") {
      return toHexFast(Utils.strToArrayBuffer(C));
    }
    return C;
  }
}

export default AESKeyWrap;
