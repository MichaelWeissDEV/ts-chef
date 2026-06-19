/**
 * @fileoverview JA4ServerFingerprint operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import Utils from "../Utils";
import { toJA4S } from "../lib/JA4";

/**
 * JA4Server Fingerprint operation
 */
export class JA4ServerFingerprint extends TypedOperation<string, string, unknown[]> {
  /**
   * JA4ServerFingerprint constructor
   */
  constructor() {
    super();

    this.name = "JA4Server Fingerprint";
    this.module = "Crypto";
    this.description =
      "Generates a JA4Server Fingerprint (JA4S) to help identify TLS servers or sessions based on hashing together values from the Server Hello.<br><br>Input: A hex stream of the TLS or QUIC Server Hello packet application layer.";
    this.infoURL =
      "https://medium.com/foxio/ja4-network-fingerprinting-9376fe9ca637";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Input format",
        type: "option",
        value: ["Hex", "Base64", "Raw"],
      },
      {
        name: "Output format",
        type: "option",
        value: ["JA4S", "JA4S Raw", "Both"],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, args: unknown[]): string {
    const [inputFormat, outputFormat] = args as [string, string];
    const inputBytes = Utils.convertToByteArray(input, inputFormat);
    const ja4s = toJA4S(new Uint8Array(inputBytes));

    // Output
    switch (outputFormat) {
      case "JA4S":
        return ja4s.JA4S;
      case "JA4S Raw":
        return ja4s.JA4S_r;
      case "Both":
      default:
        return `JA4S:   ${ja4s.JA4S}\nJA4S_r: ${ja4s.JA4S_r}`;
    }
  }
}

export default JA4ServerFingerprint;
