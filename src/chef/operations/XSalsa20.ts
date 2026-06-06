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
import { OperationError } from "../errors/OperationError";
import { Utils } from "../Utils";
import { toHex } from "../lib/Hex";
import { salsa20Block, hsalsa20 } from "../lib/Salsa20";

export class XSalsa20 extends Operation {
  constructor() {
    super();
    this.name = "XSalsa20";
    this.module = "Ciphers";
    this.description =
      "XSalsa20 is a stream cipher that extends Salsa20 with a 192-bit (24-byte) nonce.";
    this.infoURL = "https://cr.yp.to/snuffle/xsalsa-20081128.pdf";
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
        name: "Nonce",
        type: "toggleString",
        value: "",
        toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
      },
      { name: "Counter", type: "number", value: 0, min: 0 },
      { name: "Rounds", type: "option", value: ["20", "12", "8"] },
      { name: "Input", type: "option", value: ["Hex", "Raw"] },
      { name: "Output", type: "option", value: ["Raw", "Hex"] },
    ];
  }

  run(input: string, args: unknown[]): string {
    const keyArg = args[0] as { string: string; option: string };
    const nonceArg = args[1] as { string: string; option: string };
    const counterVal = args[2] as number;
    const rounds = parseInt(args[3] as string, 10);
    const inputType = args[4] as string;
    const outputType = args[5] as string;

    const key = Utils.convertToByteArray(keyArg.string, keyArg.option);
    if (key.length !== 32) {
      throw new OperationError("XSalsa20 requires a 32-byte key");
    }

    const nonce = Utils.convertToByteArray(nonceArg.string, nonceArg.option);
    if (nonce.length !== 24) {
      throw new OperationError("XSalsa20 requires a 24-byte nonce");
    }

    const subkey = hsalsa20(key, nonce.slice(0, 16), rounds);
    const subnonce = nonce.slice(16, 24);

    const inputBytes = Utils.convertToByteArray(input, inputType);
    const output: number[] = [];
    let counterAsInt = counterVal;

    for (let i = 0; i < inputBytes.length; i += 64) {
      const counter = Utils.intToByteArray(counterAsInt, 8, "little");
      const stream = salsa20Block(subkey, subnonce, counter, rounds);
      for (let j = 0; j < 64 && i + j < inputBytes.length; j++) {
        output.push(inputBytes[i + j] ^ stream[j]);
      }
      counterAsInt++;
    }

    if (outputType === "Hex") {
      return toHex(output);
    } else {
      return Utils.arrayBufferToStr(Uint8Array.from(output).buffer);
    }
  }
}

export default XSalsa20;
