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

import Operation from "../Operation";
import { genPolybiusSquare } from "../lib/Ciphers";
import OperationError from "../errors/OperationError";

/**
 * Bifid Cipher Decode operation
 */
export class BifidCipherDecode extends Operation {
  /**
   * BifidCipherDecode constructor
   */
  constructor() {
    super();

    this.name = "Bifid Cipher Decode";
    this.module = "Ciphers";
    this.description =
      "The Bifid cipher is a cipher which uses a Polybius square in conjunction with transposition, which can be fairly difficult to decipher without knowing the alphabet keyword.";
    this.infoURL = "https://wikipedia.org/wiki/Bifid_cipher";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Keyword",
        type: "string",
        value: "",
      },
    ];
  }

  /**
   * @param {string} input
   * @param {any[]} args
   * @returns {string}
   *
   * @throws {OperationError} if invalid key
   */
  run(input: string, args: any[]): string {
    const keywordStr = args[0].toUpperCase().replace(/J/g, "I"),
      keyword = [...new Set(keywordStr.split(""))],
      alpha = "ABCDEFGHIKLMNOPQRSTUVWXYZ",
      structure: (string | boolean)[] = [];

    let output = "",
      count = 0,
      trans = "";

    if (!/^[A-Z]*$/.test(keywordStr))
      throw new OperationError(
        "The key must consist only of letters in the English alphabet",
      );

    const polybius = genPolybiusSquare(keywordStr);

    input
      .replace(/J/g, "I")
      .split("")
      .forEach((letter) => {
        const alpInd = alpha.split("").indexOf(letter.toUpperCase()) >= 0;
        let polInd;

        if (alpInd) {
          for (let i = 0; i < 5; i++) {
            polInd = polybius[i].indexOf(letter.toUpperCase());
            if (polInd >= 0) {
              trans += `${i}${polInd}`;
            }
          }

          if (alpha.split("").indexOf(letter) >= 0) {
            structure.push(true);
          } else if (alpInd) {
            structure.push(false);
          }
        } else {
          structure.push(letter);
        }
      });

    structure.forEach((pos) => {
      if (typeof pos === "boolean") {
        const coords = [
          parseInt(trans[count], 10),
          parseInt(trans[count + trans.length / 2], 10),
        ];

        output += pos
          ? polybius[coords[0]][coords[1]]
          : polybius[coords[0]][coords[1]].toLowerCase();
        count++;
      } else {
        output += pos;
      }
    });

    return output;
  }
}

export default BifidCipherDecode;
