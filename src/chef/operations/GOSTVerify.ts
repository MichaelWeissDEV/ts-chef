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
import OperationError from "../errors/OperationError";
import Utils from "../Utils";
import { toHexFast } from "../lib/Hex";
import {
  CryptoGost,
  GostEngine,
} from "@wavesenterprise/crypto-gost-js/index.js";

/**
 * GOST Verify operation
 */
export class GOSTVerify extends Operation {
  /**
   * GOSTVerify constructor
   */
  constructor() {
    super();

    this.name = "GOST Verify";
    this.module = "Ciphers";
    this.description =
      "Verify the signature of a plaintext message using one of the GOST block ciphers. Enter the signature in the MAC field.";
    this.infoURL = "https://wikipedia.org/wiki/GOST_(block_cipher)";
    this.inputType = "string";
    this.outputType = "string";
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
        name: "MAC",
        type: "toggleString",
        value: "",
        toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
      },
      {
        name: "Input type",
        type: "option",
        value: ["Raw", "Hex"],
      },
      {
        name: "Algorithm",
        type: "argSelector",
        value: [
          {
            name: "GOST 28147 (1989)",
            on: [5],
          },
          {
            name: "GOST R 34.12 (Magma, 2015)",
            off: [5],
          },
          {
            name: "GOST R 34.12 (Kuznyechik, 2015)",
            off: [5],
          },
        ],
      },
      {
        name: "sBox",
        type: "option",
        value: [
          "E-TEST",
          "E-A",
          "E-B",
          "E-C",
          "E-D",
          "E-SC",
          "E-Z",
          "D-TEST",
          "D-A",
          "D-SC",
        ],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  async run(input: any, args: any[]): Promise<any> {
    const [keyObj, ivObj, macObj, inputType, version, sBox] = args;

    const key = toHexFast(
      Utils.convertToByteArray(keyObj.string, keyObj.option),
    );
    const iv = toHexFast(Utils.convertToByteArray(ivObj.string, ivObj.option));
    const mac = toHexFast(
      Utils.convertToByteArray(macObj.string, macObj.option),
    );
    input =
      inputType === "Hex" ? input : toHexFast(Utils.strToArrayBuffer(input));

    let blockLength, versionNum;
    switch (version) {
      case "GOST 28147 (1989)":
        versionNum = 1989;
        blockLength = 64;
        break;
      case "GOST R 34.12 (Magma, 2015)":
        versionNum = 2015;
        blockLength = 64;
        break;
      case "GOST R 34.12 (Kuznyechik, 2015)":
        versionNum = 2015;
        blockLength = 128;
        break;
      default:
        throw new OperationError(`Unknown algorithm version: ${version}`);
    }

    const sBoxVal = versionNum === 1989 ? sBox : null;

    const algorithm: {
      version: number;
      length: number;
      mode: string;
      sBox: unknown;
      macLength: number;
      iv?: unknown;
    } = {
      version: versionNum,
      length: blockLength,
      mode: "MAC",
      sBox: sBoxVal,
      macLength: mac.length * 4,
    };

    try {
      const Hex = CryptoGost.coding.Hex;
      if (iv) algorithm.iv = Hex.decode(iv);

      const cipher = GostEngine.getGostCipher(algorithm);
      const out = cipher.verify(
        Hex.decode(key),
        Hex.decode(mac),
        Hex.decode(input),
      );

      return out ? "The signature matches" : "The signature does not match";
    } catch (err) {
      throw new OperationError(
        err instanceof Error ? err.message : String(err),
      );
    }
  }
}

export default GOSTVerify;
