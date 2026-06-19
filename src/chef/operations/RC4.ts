/**
 * @fileoverview RC4 operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, HighlightPos, HighlightResult } from "../Operation";
import CryptoJS from "crypto-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const format: Record<string, any> = {
  UTF8: CryptoJS.enc.Utf8,
  UTF16: CryptoJS.enc.Utf16,
  UTF16LE: CryptoJS.enc.Utf16LE,
  UTF16BE: CryptoJS.enc.Utf16BE,
  Latin1: CryptoJS.enc.Latin1,
  Hex: CryptoJS.enc.Hex,
  Base64: CryptoJS.enc.Base64,
};

/**
 * RC4 operation
 */
export class RC4 extends TypedOperation<string, string, unknown[]> {
  /**
   * RC4 constructor
   */
  constructor() {
    super();

    this.name = "RC4";
    this.module = "Ciphers";
    this.description =
      "RC4 (also known as ARC4) is a widely-used stream cipher designed by Ron Rivest. It is used in popular protocols such as SSL and WEP. Although remarkable for its simplicity and speed, the algorithm's history doesn't inspire confidence in its security.";
    this.infoURL = "https://wikipedia.org/wiki/RC4";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Passphrase",
        type: "toggleString",
        value: "",
        toggleValues: [
          "UTF8",
          "UTF16",
          "UTF16LE",
          "UTF16BE",
          "Latin1",
          "Hex",
          "Base64",
        ],
      },
      {
        name: "Input format",
        type: "option",
        value: [
          "Latin1",
          "UTF8",
          "UTF16",
          "UTF16LE",
          "UTF16BE",
          "Hex",
          "Base64",
        ],
      },
      {
        name: "Output format",
        type: "option",
        value: [
          "Latin1",
          "UTF8",
          "UTF16",
          "UTF16LE",
          "UTF16BE",
          "Hex",
          "Base64",
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
    const [arg0, inputFmt, outputFmt] = args as [
      { string: string; option: string },
      string,
      string,
    ];
    const message = format[inputFmt].parse(input),
      passphrase = format[arg0.option].parse(arg0.string),
      encrypted = CryptoJS.RC4.encrypt(message, passphrase);

    return encrypted.ciphertext.toString(format[outputFmt]);
  }

  /**
   * Highlight RC4
   *
   * @param {Object[]} pos
   * @param {number} pos[].start
   * @param {number} pos[].end
   * @param {Object[]} args
   * @returns {Object[]} pos
   */
  highlight(pos: HighlightPos, _args: unknown[]): HighlightResult {
    return pos;
  }

  /**
   * Highlight RC4 in reverse
   *
   * @param {Object[]} pos
   * @param {number} pos[].start
   * @param {number} pos[].end
   * @param {Object[]} args
   * @returns {Object[]} pos
   */
  highlightReverse(pos: HighlightPos, _args: unknown[]): HighlightResult {
    return pos;
  }
}

export default RC4;
