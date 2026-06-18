/**
 * @fileoverview AESDecrypt operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import Operation from "../Operation";
import Utils from "../Utils";
import forge from "node-forge";
import OperationError from "../errors/OperationError";

/**
 * AES Decrypt operation
 */
interface ToggleStringArg {
  string: string;
  option: string;
}

// forge cipher Mode plus the optional pad/unpad hooks used for NoPadding modes.
interface ForgeMutableMode extends forge.cipher.Mode {
  pad?: () => boolean;
  unpad?: () => boolean;
}

export class AESDecrypt extends Operation {
  /**
   * AESDecrypt constructor
   */
  constructor() {
    super();

    this.name = "AES Decrypt";
    this.module = "Ciphers";
    this.description =
      "Advanced Encryption Standard (AES) is a U.S. Federal Information Processing Standard (FIPS). It was selected after a 5-year process where 15 competing designs were evaluated.<br><br><b>Key:</b> The following algorithms will be used based on the size of the key:<ul><li>16 bytes = AES-128</li><li>24 bytes = AES-192</li><li>32 bytes = AES-256</li></ul><br><br><b>IV:</b> The Initialization Vector should be 16 bytes long. If not entered, it will default to 16 null bytes.<br><br><b>Padding:</b> In CBC and ECB mode, PKCS#7 padding will be used as a default.<br><br><b>GCM Tag:</b> This field is ignored unless 'GCM' mode is used.";
    this.infoURL = "https://wikipedia.org/wiki/Advanced_Encryption_Standard";
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
        type: "argSelector",
        value: [
          {
            name: "CBC",
            off: [5, 6],
          },
          {
            name: "CFB",
            off: [5, 6],
          },
          {
            name: "OFB",
            off: [5, 6],
          },
          {
            name: "CTR",
            off: [5, 6],
          },
          {
            name: "GCM",
            on: [5, 6],
          },
          {
            name: "ECB",
            off: [5, 6],
          },
          {
            name: "CBC/NoPadding",
            off: [5, 6],
          },
          {
            name: "ECB/NoPadding",
            off: [5, 6],
          },
        ],
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
      {
        name: "GCM Tag",
        type: "toggleString",
        value: "",
        toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
      },
      {
        name: "Additional Authenticated Data",
        type: "toggleString",
        value: "",
        toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {any[]} args
   * @returns {string}
   *
   * @throws {OperationError} if cannot decrypt input or invalid key length
   */
  run(input: string, args: unknown[]): string {
    const [keyArg, ivArg, modeArg, inputType, outputType, gcmTagArg, aadArg] =
      args as [
        ToggleStringArg,
        ToggleStringArg,
        string,
        string,
        string,
        ToggleStringArg,
        ToggleStringArg,
      ];
    const key = Utils.convertToByteString(keyArg.string, keyArg.option),
      iv = Utils.convertToByteString(ivArg.string, ivArg.option),
      mode = modeArg.split("/")[0],
      noPadding = modeArg.endsWith("NoPadding"),
      gcmTag = Utils.convertToByteString(gcmTagArg.string, gcmTagArg.option),
      aad = Utils.convertToByteString(aadArg.string, aadArg.option);

    if ([16, 24, 32].indexOf(key.length) < 0) {
      throw new OperationError(`Invalid key length: ${key.length} bytes

The following algorithms will be used based on the size of the key:
  16 bytes = AES-128
  24 bytes = AES-192
  32 bytes = AES-256`);
    }

    const byteInput = Utils.convertToByteString(input, inputType);

    const decipher = forge.cipher.createDecipher(
      ("AES-" + mode) as forge.cipher.Algorithm,
      key,
    );

    /* Allow for a "no padding" mode */
    if (noPadding) {
      (decipher.mode as ForgeMutableMode).unpad = function () {
        return true;
      };
    }

    decipher.start({
      iv: iv.length === 0 ? "" : iv,
      tag: mode === "GCM" ? forge.util.createBuffer(gcmTag) : undefined,
      additionalData: mode === "GCM" ? aad : undefined,
    } as forge.cipher.StartOptions);
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

export default AESDecrypt;
