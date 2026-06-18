/**
 * @fileoverview PseudoRandomNumberGenerator operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, AnyInput } from "../Operation";
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
  run(input: string, args: unknown[]): string {
    const [numBytes, outputAs] = args as [number, string];

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
