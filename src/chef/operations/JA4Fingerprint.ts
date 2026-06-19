/**
 * @fileoverview JA4Fingerprint operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import Utils from "../Utils";
import { toJA4 } from "../lib/JA4";

/**
 * JA4 Fingerprint operation
 */
export class JA4Fingerprint extends TypedOperation<string, string, unknown[]> {
  /**
   * JA4Fingerprint constructor
   */
  constructor() {
    super();

    this.name = "JA4 Fingerprint";
    this.module = "Crypto";
    this.description =
      "Generates a JA4 fingerprint to help identify TLS clients based on hashing together values from the Client Hello.<br><br>Input: A hex stream of the TLS or QUIC Client Hello packet application layer.";
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
        value: [
          "JA4",
          "JA4 Original Rendering",
          "JA4 Raw",
          "JA4 Raw Original Rendering",
          "All",
        ],
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
    const ja4 = toJA4(new Uint8Array(inputBytes));

    // Output
    switch (outputFormat) {
      case "JA4":
        return ja4.JA4;
      case "JA4 Original Rendering":
        return ja4.JA4_o;
      case "JA4 Raw":
        return ja4.JA4_r;
      case "JA4 Raw Original Rendering":
        return ja4.JA4_ro;
      case "All":
      default:
        return `JA4:    ${ja4.JA4}
JA4_o:  ${ja4.JA4_o}
JA4_r:  ${ja4.JA4_r}
JA4_ro: ${ja4.JA4_ro}`;
    }
  }
}

export default JA4Fingerprint;
