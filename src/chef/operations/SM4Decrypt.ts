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
import { Utils } from "../Utils";
import { OperationError } from "../errors/OperationError";
import { toHex } from "../lib/Hex";
import { decryptSM4 } from "../lib/SM4";

export class SM4Decrypt extends Operation {
  constructor() {
    super();
    this.name = "SM4 Decrypt";
    this.module = "Ciphers";
    this.description =
      "SM4 is a 128-bit block cipher, currently established as a national standard (GB/T 32907-2016) of China.";
    this.infoURL = "https://wikipedia.org/wiki/SM4_(cipher)";
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
        value: [
          "CBC",
          "CFB",
          "OFB",
          "CTR",
          "ECB",
          "CBC/NoPadding",
          "ECB/NoPadding",
        ],
      },
      { name: "Input", type: "option", value: ["Raw", "Hex"] },
      { name: "Output", type: "option", value: ["Hex", "Raw"] },
    ];
  }

  run(input: string, args: unknown[]): string {
    const keyArg = args[0] as { string: string; option: string };
    const ivArg = args[1] as { string: string; option: string };
    const mode = args[2] as string;
    const inputType = args[3] as string;
    const outputType = args[4] as string;

    const key = Utils.convertToByteArray(keyArg.string, keyArg.option);
    const iv = Utils.convertToByteArray(ivArg.string, ivArg.option);

    if (key.length !== 16)
      throw new OperationError(
        `Invalid key length: ${key.length} bytes. SM4 uses 16 bytes.`,
      );
    if (iv.length !== 16 && !mode.startsWith("ECB"))
      throw new OperationError(
        `Invalid IV length: ${iv.length} bytes. SM4 uses 16 bytes.`,
      );

    const inputBytes = Utils.convertToByteArray(input, inputType);
    const output = decryptSM4(
      inputBytes,
      key,
      iv,
      mode.substring(0, 3),
      mode.endsWith("NoPadding"),
    );
    return outputType === "Hex" ? toHex(output) : Utils.byteArrayToUtf8(output);
  }
}

export default SM4Decrypt;
