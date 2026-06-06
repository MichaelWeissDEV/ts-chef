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
import Utils from "../Utils";
import forge from "node-forge";
import BigNumber from "bignumber.js";

/**
 * Pseudo-Random Number Generator operation
 */
export class PseudoRandomNumberGenerator extends Operation {
  /**
   * PseudoRandomNumberGenerator constructor
   */
  constructor() {
    super();

    this.name = "Pseudo-Random Number Generator";
    this.module = "Ciphers";
    this.description =
      "A cryptographically-secure pseudo-random number generator (PRNG).<br><br>This operation uses the browser's built-in <code>crypto.getRandomValues()</code> method if available. If this cannot be found, it falls back to a Fortuna-based PRNG algorithm.";
    this.infoURL = "https://wikipedia.org/wiki/Pseudorandom_number_generator";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Number of bytes",
        type: "number",
        value: 32,
      },
      {
        name: "Output as",
        type: "option",
        value: ["Hex", "Integer", "Byte array", "Raw"],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const [numBytes, outputAs] = args;

    let bytes;

    if (self.crypto) {
      bytes = new ArrayBuffer(numBytes);
      const CHUNK_SIZE = 65536;
      for (let i = 0; i < numBytes; i += CHUNK_SIZE) {
        self.crypto.getRandomValues(
          new Uint8Array(bytes, i, Math.min(numBytes - i, CHUNK_SIZE)),
        );
      }
      bytes = Utils.arrayBufferToStr(bytes);
    } else {
      bytes = forge.random.getBytesSync(numBytes);
    }

    let value = new BigNumber(0),
      i;

    switch (outputAs) {
      case "Hex":
        return forge.util.bytesToHex(bytes);
      case "Integer":
        for (i = bytes.length - 1; i >= 0; i--) {
          value = value.times(256).plus(bytes.charCodeAt(i));
        }
        return value.toFixed();
      case "Byte array":
        return JSON.stringify(Utils.strToCharcode(bytes));
      case "Raw":
      default:
        return bytes;
    }
  }
}

export default PseudoRandomNumberGenerator;
