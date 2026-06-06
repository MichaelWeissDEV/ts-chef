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

export class Substitute extends Operation {
  constructor() {
    super();
    this.name = "Substitute";
    this.module = "Default";
    this.description =
      "A substitution cipher allowing you to specify bytes to replace with other byte values.";
    this.infoURL = "https://wikipedia.org/wiki/Substitution_cipher";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Plaintext",
        type: "binaryString",
        value: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      },
      {
        name: "Ciphertext",
        type: "binaryString",
        value: "XYZABCDEFGHIJKLMNOPQRSTUVW",
      },
      { name: "Ignore case", type: "boolean", value: false },
    ];
  }

  private cipherSingleChar(
    char: string,
    dict: Record<string, string>,
    ignoreCase: boolean,
  ): string {
    if (!ignoreCase) return dict[char] ?? char;
    const isUpperCase = char === char.toUpperCase();
    if (dict[char] !== undefined) {
      return isUpperCase ? dict[char].toUpperCase() : dict[char].toLowerCase();
    }
    if (isUpperCase) {
      if (dict[char.toLowerCase()] !== undefined)
        return dict[char.toLowerCase()].toUpperCase();
    } else {
      if (dict[char.toUpperCase()] !== undefined)
        return dict[char.toUpperCase()].toLowerCase();
    }
    return char;
  }

  run(input: string, args: unknown[]): string {
    const [plaintextArg, ciphertextArg, ignoreCase] = args as [
      string,
      string,
      boolean,
    ];
    const plaintext = Utils.expandAlphRange(plaintextArg);
    const ciphertext = Utils.expandAlphRange(ciphertextArg);

    let output = "";
    if (plaintext.length !== ciphertext.length) {
      output = "Warning: Plaintext and Ciphertext lengths differ\n\n";
    }

    const dict: Record<string, string> = {};
    for (let i = 0; i < Math.min(ciphertext.length, plaintext.length); i++) {
      dict[plaintext[i]] = ciphertext[i];
    }

    for (const character of input) {
      output += this.cipherSingleChar(character, dict, ignoreCase);
    }
    return output;
  }
}

export default Substitute;
