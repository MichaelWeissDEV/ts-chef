/**
 * @fileoverview RC4Drop operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, HighlightPos, HighlightResult } from "../Operation";
import { format } from "../lib/Ciphers";
import CryptoJS from "crypto-js";

/**
 * RC4 Drop operation
 */
export class RC4Drop extends Operation {
  /**
   * RC4Drop constructor
   */
  constructor() {
    super();

    this.name = "RC4 Drop";
    this.module = "Ciphers";
    this.description =
      "It was discovered that the first few bytes of the RC4 keystream are strongly non-random and leak information about the key. We can defend against this attack by discarding the initial portion of the keystream. This modified algorithm is traditionally called RC4-drop.";
    this.infoURL =
      "https://wikipedia.org/wiki/RC4#Fluhrer,_Mantin_and_Shamir_attack";
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
      {
        name: "Number of dwords to drop",
        type: "number",
        value: 192,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, args: unknown[]): string {
    const [arg0, inputFmt, outputFmt, drop] = args as [
      { string: string; option: string },
      string,
      string,
      number,
    ];
    const message = format[inputFmt].parse(input),
      passphrase = format[arg0.option].parse(arg0.string),
      encrypted = CryptoJS.RC4Drop.encrypt(message, passphrase, { drop });

    return encrypted.ciphertext.toString(format[outputFmt]);
  }

  /**
   * Highlight RC4 Drop
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
   * Highlight RC4 Drop in reverse
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

export default RC4Drop;
