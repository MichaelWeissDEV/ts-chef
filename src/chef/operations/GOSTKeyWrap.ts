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
import { toHexFast, fromHex } from "../lib/Hex";
import {
  CryptoGost,
  GostEngine,
} from "@wavesenterprise/crypto-gost-js/index.js";

/**
 * GOST Key Wrap operation
 */
export class GOSTKeyWrap extends Operation {
  /**
   * GOSTKeyWrap constructor
   */
  constructor() {
    super();

    this.name = "GOST Key Wrap";
    this.module = "Ciphers";
    this.description =
      "A key wrapping algorithm for protecting keys in untrusted storage using one of the GOST block cipers.";
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
        name: "User Key Material",
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
        name: "Output type",
        type: "option",
        value: ["Hex", "Raw"],
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
      {
        name: "Key wrapping",
        type: "option",
        value: ["NO", "CP", "SC"],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  async run(input: any, args: any[]): Promise<any> {
    const [keyObj, ukmObj, inputType, outputType, version, sBox, keyWrapping] =
      args;

    const key = toHexFast(
      Utils.convertToByteArray(keyObj.string, keyObj.option),
    );
    const ukm = toHexFast(
      Utils.convertToByteArray(ukmObj.string, ukmObj.option),
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
      keyWrapping: unknown;
      ukm?: unknown;
    } = {
      version: versionNum,
      length: blockLength,
      mode: "KW",
      sBox: sBoxVal,
      keyWrapping: keyWrapping,
    };

    try {
      const Hex = CryptoGost.coding.Hex;
      algorithm.ukm = Hex.decode(ukm);

      const cipher = GostEngine.getGostCipher(algorithm);
      const out = Hex.encode(
        cipher.wrapKey(Hex.decode(key), Hex.decode(input)),
      );

      return outputType === "Hex" ? out : Utils.byteArrayToChars(fromHex(out));
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes("Invalid typed array length")) {
        throw new OperationError(
          "Incorrect input length. Must be a multiple of the block size.",
        );
      }
      throw new OperationError(errMsg);
    }
  }
}

export default GOSTKeyWrap;
