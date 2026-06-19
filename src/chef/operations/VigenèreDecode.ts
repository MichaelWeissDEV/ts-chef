/**
 * @fileoverview VigenèreDecode operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput, HighlightPos, HighlightResult } from "../Operation_new";
import OperationError from "../errors/OperationError";
/**
 * Vigenère Decode operation
 */
class VigenèreDecode extends TypedOperation<AnyInput, AnyInput, unknown[]> {
  /**
   * VigenèreDecode constructor
   */
  constructor() {
    super();

    this.name = "Vigenère Decode";
    this.module = "Ciphers";
    this.description =
      "The Vigenere cipher is a method of encrypting alphabetic text by using a series of different Caesar ciphers based on the letters of a keyword. It is a simple form of polyalphabetic substitution.";
    this.infoURL = "https://wikipedia.org/wiki/Vigenère_cipher";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Key",
        type: "string",
        value: "",
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: AnyInput, args: unknown[]): AnyInput {
    const [keyRaw] = args as [string];
    const alphabet = "abcdefghijklmnopqrstuvwxyz",
      key = keyRaw.toLowerCase();
    const inputStr = input as string;
    let output = "",
      fail = 0,
      keyIndex,
      msgIndex,
      chr;

    if (!key) throw new OperationError("No key entered");
    if (!/^[a-zA-Z]+$/.test(key))
      throw new OperationError("The key must consist only of letters");

    for (let i = 0; i < inputStr.length; i++) {
      if (alphabet.indexOf(inputStr[i]) >= 0) {
        chr = key[(i - fail) % key.length];
        keyIndex = alphabet.indexOf(chr);
        msgIndex = alphabet.indexOf(inputStr[i]);
        // Subtract indexes from each other, add 26 just in case the value is negative,
        // modulo to remove if necessary
        output += alphabet[(msgIndex - keyIndex + alphabet.length) % 26];
      } else if (alphabet.indexOf(inputStr[i].toLowerCase()) >= 0) {
        chr = key[(i - fail) % key.length].toLowerCase();
        keyIndex = alphabet.indexOf(chr);
        msgIndex = alphabet.indexOf(inputStr[i].toLowerCase());
        output +=
          alphabet[(msgIndex + alphabet.length - keyIndex) % 26].toUpperCase();
      } else {
        output += inputStr[i];
        fail++;
      }
    }

    return output;
  }

  /**
   * Highlight Vigenère Decode
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
   * Highlight Vigenère Decode in reverse
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

export default VigenèreDecode;
