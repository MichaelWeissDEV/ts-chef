/**
 * @fileoverview GOSTSign operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import OperationError from "../errors/OperationError";
import Utils from "../Utils";
import { toHexFast, fromHex } from "../lib/Hex";
import {
  CryptoGost,
  GostEngine,
} from "@wavesenterprise/crypto-gost-js/index.js";

/**
 * GOST Sign operation
 */
export class GOSTSign extends TypedOperation<string, Promise<AnyInput>, unknown[]> {
  /**
   * GOSTSign constructor
   */
  constructor() {
    super();

    this.name = "GOST Sign";
    this.module = "Ciphers";
    this.description =
      "Sign a plaintext message using one of the GOST block ciphers.";
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
        name: "MAC length",
        type: "number",
        value: 32,
        min: 8,
        max: 64,
        step: 8,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  async run(input: string, args: unknown[]): Promise<AnyInput> {
    const [keyObj, ivObj, inputType, outputType, version, sBox, macLength] =
      args as [
        { string: string; option: string },
        { string: string; option: string },
        string,
        string,
        string,
        string,
        number,
      ];

    const key = toHexFast(
      Utils.convertToByteArray(keyObj.string, keyObj.option),
    );
    const iv = toHexFast(Utils.convertToByteArray(ivObj.string, ivObj.option));
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
      macLength: unknown;
      iv?: unknown;
    } = {
      version: versionNum,
      length: blockLength,
      mode: "MAC",
      sBox: sBoxVal,
      macLength: macLength,
    };

    try {
      const Hex = CryptoGost.coding.Hex;
      if (iv) algorithm.iv = Hex.decode(iv);

      const cipher = GostEngine.getGostCipher(algorithm);
      const out = Hex.encode(cipher.sign(Hex.decode(key), Hex.decode(input)));

      return outputType === "Hex" ? out : Utils.byteArrayToChars(fromHex(out));
    } catch (err) {
      throw new OperationError(
        err instanceof Error ? err.message : String(err),
      );
    }
  }
}

export default GOSTSign;
