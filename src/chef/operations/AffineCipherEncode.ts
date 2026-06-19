/**
 * @fileoverview AffineCipherEncode operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";
import { affineEncode } from "../lib/Ciphers";

export class AffineCipherEncode extends TypedOperation<string, string, number[]> {
  constructor() {
    super();
    this.name = "Affine Cipher Encode";
    this.module = "Ciphers";
    this.description =
      "The Affine cipher is a type of monoalphabetic substitution cipher, wherein each letter in an alphabet is mapped to its numeric equivalent, encrypted using simple mathematical function (ax + b) % 26, and converted back to a letter.";
    this.infoURL = "https://wikipedia.org/wiki/Affine_cipher";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "a", type: "number", value: 1 },
      { name: "b", type: "number", value: 0 },
    ];
  }

  run(input: string, args: number[]): string {
    return affineEncode(input, args);
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

export default AffineCipherEncode;
