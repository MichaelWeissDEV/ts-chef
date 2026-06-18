/**
 * @fileoverview AESEncrypt operation - Ported from GCHQ's CyberChef
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
 * AES Encrypt operation
 *
 * @category Ciphers
 * @see https://wikipedia.org/wiki/Advanced_Encryption_Standard
 * @see AESDecrypt
 * @see AESKeyWrap
 * @see AESKeyUnwrap
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

export class AESEncrypt extends Operation {
  /**
   * AESEncrypt constructor
   */
  constructor() {
    super();

    this.name = "AES Encrypt";
    this.module = "Ciphers";
    this.description =
      "Advanced Encryption Standard (AES) is a U.S. Federal Information Processing Standard (FIPS). It was selected after a 5-year process where 15 competing designs were evaluated.<br><br><b>Key:</b> The following algorithms will be used based on the size of the key:<ul><li>16 bytes = AES-128</li><li>24 bytes = AES-192</li><li>32 bytes = AES-256</li></ul>You can generate a password-based key using one of the KDF operations.<br><br><b>IV:</b> The Initialization Vector should be 16 bytes long. If not entered, it will default to 16 null bytes.<br><br><b>Padding:</b> In CBC and ECB mode, PKCS#7 padding will be used.";
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
            off: [5],
          },
          {
            name: "CFB",
            off: [5],
          },
          {
            name: "OFB",
            off: [5],
          },
          {
            name: "CTR",
            off: [5],
          },
          {
            name: "GCM",
            on: [5],
          },
          {
            name: "ECB",
            off: [5],
          },
          {
            name: "CBC/NoPadding",
            off: [5],
          },
          {
            name: "ECB/NoPadding",
            off: [5],
          },
        ],
      },
      {
        name: "Input",
        type: "option",
        value: ["Raw", "Hex"],
      },
      {
        name: "Output",
        type: "option",
        value: ["Hex", "Raw"],
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
   * Runs the operation.
   *
   * @param {string} input - The input string to encrypt.
   * @param {any[]} args - Operation arguments.
   * @param {Object} args[0] - The encryption key.
   * @param {string} args[0].string - The key value.
   * @param {string} args[0].option - The key format (Hex, UTF8, Latin1, Base64).
   * @param {Object} args[1] - The initialization vector.
   * @param {string} args[1].string - The IV value.
   * @param {string} args[1].option - The IV format (Hex, UTF8, Latin1, Base64).
   * @param {string} args[2] - The encryption mode (e.g., CBC, GCM).
   * @param {string} args[3] - The input format (Raw, Hex).
   * @param {string} args[4] - The output format (Hex, Raw).
   * @param {Object} args[5] - Additional Authenticated Data (for GCM).
   * @returns {string} The encrypted string.
   *
   * @throws {OperationError} if invalid key length or padding issues.
   */
  run(input: string, args: unknown[]): string {
    const [keyArg, ivArg, modeArg, inputType, outputType, aadArg] = args as [
      ToggleStringArg,
      ToggleStringArg,
      string,
      string,
      string,
      ToggleStringArg,
    ];
    const key = Utils.convertToByteString(keyArg.string, keyArg.option),
      iv = Utils.convertToByteString(ivArg.string, ivArg.option),
      mode = modeArg.split("/")[0],
      noPadding = modeArg.endsWith("NoPadding"),
      aad = Utils.convertToByteString(aadArg.string, aadArg.option);

    if ([16, 24, 32].indexOf(key.length) < 0) {
      throw new OperationError(`Invalid key length: ${key.length} bytes

The following algorithms will be used based on the size of the key:
  16 bytes = AES-128
  24 bytes = AES-192
  32 bytes = AES-256`);
    }

    const byteInput = Utils.convertToByteString(input, inputType);

    // Handle NoPadding modes
    if (noPadding && byteInput.length % 16 !== 0) {
      throw new OperationError(
        "Input length must be a multiple of 16 bytes for NoPadding modes.",
      );
    }
    const cipher = forge.cipher.createCipher(
      ("AES-" + mode) as forge.cipher.Algorithm,
      key,
    );
    cipher.start({
      iv: iv,
      additionalData: mode === "GCM" ? aad : undefined,
    } as forge.cipher.StartOptions);
    if (noPadding) {
      (cipher.mode as ForgeMutableMode).pad = function () {
        return true;
      };
    }
    cipher.update(forge.util.createBuffer(byteInput));
    cipher.finish();

    if (outputType === "Hex") {
      if (mode === "GCM") {
        return (
          cipher.output.toHex() + "\n\n" + "Tag: " + cipher.mode.tag.toHex()
        );
      }
      return cipher.output.toHex();
    } else {
      if (mode === "GCM") {
        return (
          cipher.output.getBytes() +
          "\n\n" +
          "Tag: " +
          cipher.mode.tag.getBytes()
        );
      }
      return cipher.output.getBytes();
    }
  }
}

export default AESEncrypt;
