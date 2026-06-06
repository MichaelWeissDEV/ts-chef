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
export class RC4 extends Operation {
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
  run(input: any, args: any[]): any {
    const message = format[args[1]].parse(input),
      passphrase = format[args[0].option].parse(args[0].string),
      encrypted = CryptoJS.RC4.encrypt(message, passphrase);

    return encrypted.ciphertext.toString(format[args[2]]);
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
  highlight(pos: any, args: any[]): any {
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
  highlightReverse(pos: any, args: any[]): any {
    return pos;
  }
}

export default RC4;
