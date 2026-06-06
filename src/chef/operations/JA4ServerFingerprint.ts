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
import { toJA4S } from "../lib/JA4";

/**
 * JA4Server Fingerprint operation
 */
export class JA4ServerFingerprint extends Operation {
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
  run(input: any, args: any[]): any {
    const [inputFormat, outputFormat] = args;
    input = Utils.convertToByteArray(input, inputFormat);
    const ja4s = toJA4S(new Uint8Array(input));

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
