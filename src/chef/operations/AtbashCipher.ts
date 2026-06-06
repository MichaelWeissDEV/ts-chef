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
import { affineEncode } from "../lib/Ciphers";

/**
 * Atbash Cipher operation
 *
 * @category Ciphers
 * @see https://wikipedia.org/wiki/Atbash
 */
export class AtbashCipher extends Operation {
  constructor() {
    super();
    this.name = "Atbash Cipher";
    this.module = "Ciphers";
    this.description =
      "Atbash is a mono-alphabetic substitution cipher originally used to encode the Hebrew alphabet. It has been modified here for use with the Latin alphabet.";
    this.infoURL = "https://wikipedia.org/wiki/Atbash";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * Runs the Atbash Cipher operation.
   *
   * @param {string} input - The text to encode/decode.
   * @param {unknown[]} _args - The operation arguments (none).
   * @returns {string} The encoded/decoded text.
   */
  run(input: string, _args: unknown[]): string {
    return affineEncode(input, [25, 25]);
  }

  highlight(
    pos: Array<{ start: number; end: number }>,
    _args: unknown[],
  ): Array<{ start: number; end: number }> {
    return pos;
  }

  highlightReverse(
    pos: Array<{ start: number; end: number }>,
    _args: unknown[],
  ): Array<{ start: number; end: number }> {
    return pos;
  }
}

export default AtbashCipher;
