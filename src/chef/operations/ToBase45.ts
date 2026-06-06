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

const BASE45_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

/**
 * To Base45 operation
 */
export class ToBase45 extends Operation {
  /**
   * ToBase45 constructor
   */
  constructor() {
    super();
    this.name = "To Base45";
    this.module = "Default";
    this.description =
      "Base45 encodes data (used in EU Digital COVID Certificate).";
    this.infoURL = "https://datatracker.ietf.org/doc/draft-faltstrom-base45/";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [{ name: "Alphabet", type: "string", value: BASE45_ALPHABET }];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: ArrayBuffer, args: unknown[]): string {
    const alphabetStr = (args[0] as string) || BASE45_ALPHABET;
    const alphabet = Utils.expandAlphRange(alphabetStr).join("");
    const bytes = new Uint8Array(input);
    let result = "";

    for (let i = 0; i < bytes.length; i += 2) {
      if (i + 1 < bytes.length) {
        const n = (bytes[i] << 8) | bytes[i + 1];
        const c = n % 45;
        const d = ((n / 45) | 0) % 45;
        const e = (n / (45 * 45)) | 0;
        result += alphabet[c] + alphabet[d] + alphabet[e];
      } else {
        const n = bytes[i];
        const c = n % 45;
        const d = (n / 45) | 0;
        result += alphabet[c] + alphabet[d];
      }
    }

    return result;
  }
}

export default ToBase45;
export { BASE45_ALPHABET };
