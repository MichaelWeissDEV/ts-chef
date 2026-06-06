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
import forge from "node-forge";
import OperationError from "../errors/OperationError";
import { Blowfish } from "../lib/Blowfish";

/**
 * Blowfish Decrypt operation
 */
export class BlowfishDecrypt extends Operation {
  /**
   * BlowfishDecrypt constructor
   */
  constructor() {
    super();

    this.name = "Blowfish Decrypt";
    this.module = "Ciphers";
    this.description =
      "Blowfish is a symmetric-key block cipher designed in 1993 by Bruce Schneier and included in a large number of cipher suites and encryption products. AES now receives more attention.<br><br><b>IV:</b> The Initialization Vector should be 8 bytes long. If not entered, it will default to 8 null bytes.";
    this.infoURL = "https://wikipedia.org/wiki/Blowfish_(cipher)";
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
        name: "Mode",
        type: "option",
        value: ["CBC", "CFB", "OFB", "CTR", "ECB"],
      },
      {
        name: "Input",
        type: "option",
        value: ["Hex", "Raw"],
      },
      {
        name: "Output",
        type: "option",
        value: ["Raw", "Hex"],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {any[]} args
   * @returns {string}
   */
  run(input: string, args: any[]): string {
    const key = Utils.convertToByteString(args[0].string, args[0].option),
      iv = Utils.convertToByteString(args[1].string, args[1].option),
      mode = args[2],
      inputType = args[3],
      outputType = args[4];

    if (key.length < 4 || key.length > 56) {
      throw new OperationError(`Invalid key length: ${key.length} bytes

Blowfish's key length needs to be between 4 and 56 bytes (32-448 bits).`);
    }

    if (mode !== "ECB" && iv.length !== 8) {
      throw new OperationError(
        `Invalid IV length: ${iv.length} bytes. Expected 8 bytes.`,
      );
    }

    const byteInput = Utils.convertToByteString(input, inputType);

    const decipher = Blowfish.createDecipher(key, mode);
    decipher.start({ iv: iv });
    decipher.update(forge.util.createBuffer(byteInput));
    const result = decipher.finish();

    if (result) {
      return outputType === "Hex"
        ? decipher.output.toHex()
        : decipher.output.getBytes();
    } else {
      throw new OperationError(
        "Unable to decrypt input with these parameters.",
      );
    }
  }
}

export default BlowfishDecrypt;
