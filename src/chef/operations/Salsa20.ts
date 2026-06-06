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
import { salsa20Block } from "../lib/Salsa20";

export class Salsa20 extends Operation {
  constructor() {
    super();
    this.name = "Salsa20";
    this.module = "Ciphers";
    this.description =
      "Salsa20 is a stream cipher designed by Daniel J. Bernstein. It uses a key of 16 or 32 bytes and a nonce of 8 bytes.";
    this.infoURL = "https://wikipedia.org/wiki/Salsa20";
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
        toggleValues: ["Hex", "UTF8", "Latin1", "Base64", "Integer"],
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
    if (key.length !== 16 && key.length !== 32) {
      throw new OperationError(
        `Invalid key length: ${key.length} bytes. Salsa20 uses 16 or 32 bytes.`,
      );
    }

    let nonce: number[];
    if (nonceArg.option === "Integer") {
      nonce = Utils.intToByteArray(parseInt(nonceArg.string, 10), 8, "little");
    } else {
      nonce = Utils.convertToByteArray(nonceArg.string, nonceArg.option);
      if (nonce.length !== 8) {
        throw new OperationError(
          `Invalid nonce length: ${nonce.length} bytes. Salsa20 uses 8 bytes.`,
        );
      }
    }

    const inputBytes = Utils.convertToByteArray(input, inputType);
    const output: number[] = [];
    let counterAsInt = counterVal;

    for (let i = 0; i < inputBytes.length; i += 64) {
      const counter = Utils.intToByteArray(counterAsInt, 8, "little");
      const stream = salsa20Block(key, nonce, counter, rounds);
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

export default Salsa20;
