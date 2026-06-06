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
import { Utils } from "../Utils";
import { OperationError } from "../errors/OperationError";

export class AffineCipherDecode extends Operation {
  constructor() {
    super();
    this.name = "Affine Cipher Decode";
    this.module = "Ciphers";
    this.description =
      "The Affine cipher is a type of monoalphabetic substitution cipher. To decrypt, each letter in an alphabet is mapped to its numeric equivalent, decrypted by a mathematical function, and converted back to a letter.";
    this.infoURL = "https://wikipedia.org/wiki/Affine_cipher";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "a", type: "number", value: 1 },
      { name: "b", type: "number", value: 0 },
    ];
  }

  run(input: string, args: number[]): string {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const [a, b] = args;
    const aModInv = Utils.modInv(a, 26);
    let output = "";

    if (
      !/^\+?(0|[1-9]\d*)$/.test(String(a)) ||
      !/^\+?(0|[1-9]\d*)$/.test(String(b))
    ) {
      throw new OperationError("The values of a and b can only be integers.");
    }

    if (Utils.gcd(a, 26) !== 1) {
      throw new OperationError("The value of `a` must be coprime to 26.");
    }

    for (let i = 0; i < input.length; i++) {
      if (alphabet.indexOf(input[i]) >= 0) {
        output +=
          alphabet[Utils.mod((alphabet.indexOf(input[i]) - b) * aModInv, 26)];
      } else if (alphabet.indexOf(input[i].toLowerCase()) >= 0) {
        output +=
          alphabet[
            Utils.mod(
              (alphabet.indexOf(input[i].toLowerCase()) - b) * aModInv,
              26,
            )
          ].toUpperCase();
      } else {
        output += input[i];
      }
    }
    return output;
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

export default AffineCipherDecode;
