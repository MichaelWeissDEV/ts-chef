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
import { keccak224, keccak256, keccak384, keccak512 } from "js-sha3";
import OperationError from "../errors/OperationError";

/**
 * Keccak operation
 */
export class Keccak extends Operation {
  /**
   * Keccak constructor
   */
  constructor() {
    super();

    this.name = "Keccak";
    this.module = "Crypto";
    this.description =
      "The Keccak hash algorithm was designed by Guido Bertoni, Joan Daemen, Micha\xebl Peeters, and Gilles Van Assche, building upon RadioGat\xfan. It was selected as the winner of the SHA-3 design competition.<br><br>This version of the algorithm is Keccak[c=2d] and differs from the SHA-3 specification.";
    this.infoURL = "https://wikipedia.org/wiki/SHA-3";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      {
        name: "Size",
        type: "option",
        value: ["512", "384", "256", "224"],
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const size = parseInt(args[0], 10);
    let algo;

    switch (size) {
      case 224:
        algo = keccak224;
        break;
      case 384:
        algo = keccak384;
        break;
      case 256:
        algo = keccak256;
        break;
      case 512:
        algo = keccak512;
        break;
      default:
        throw new OperationError("Invalid size");
    }

    return algo(input);
  }
}

export default Keccak;
