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

import { Operation, ArgConfig } from "../Operation";
import { encode } from "../lib/CipherSaber2";
import { Utils } from "../Utils";
import * as crypto from "crypto";

/**
 * CipherSaber2 Encrypt operation
 *
 * @category Crypto
 * @see https://wikipedia.org/wiki/CipherSaber
 */
export class CipherSaber2Encrypt extends Operation {
  name = "CipherSaber2 Encrypt";
  module = "Crypto";
  description =
    "CipherSaber is a simple symmetric encryption protocol based on the RC4 stream cipher. It gives reasonably strong protection of message confidentiality, yet it's designed to be simple enough that even novice programmers can memorize the algorithm and implement it from scratch.";
  infoURL = "https://wikipedia.org/wiki/CipherSaber";
  inputType = "ArrayBuffer";
  outputType = "ArrayBuffer";
  args: ArgConfig[] = [
    {
      name: "Key",
      type: "toggleString",
      value: "",
      toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
    },
    {
      name: "Rounds",
      type: "number",
      value: 20,
    },
  ];

  /**
   * Runs the operation.
   *
   * @param {ArrayBuffer} input
   * @param {any[]} args
   * @returns {ArrayBuffer}
   */
  run(input: ArrayBuffer, args: any[]): ArrayBuffer {
    const inputBytes = new Uint8Array(input);
    const key = Utils.convertToByteArray(args[0].string, args[0].option);
    const rounds = args[1];

    const tempIVP = crypto.randomBytes(10);
    const result = Array.from(tempIVP);
    const encrypted = encode(tempIVP, key, rounds, inputBytes);
    return new Uint8Array(result.concat(encrypted)).buffer;
  }
}

export default CipherSaber2Encrypt;
