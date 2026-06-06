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
import OperationError from "../errors/OperationError";
import GostDigest from "../vendor/gost/gostDigest";
import { toHexFast } from "../lib/Hex";

/**
 * GOST hash operation
 */
export class GOSTHash extends Operation {
  /**
   * GOSTHash constructor
   */
  constructor() {
    super();

    this.name = "GOST Hash";
    this.module = "Hashing";
    this.description =
      "The GOST hash function, defined in the standards GOST R 34.11-94 and GOST 34.311-95 is a 256-bit cryptographic hash function. It was initially defined in the Russian national standard GOST R 34.11-94 <i>Information Technology – Cryptographic Information Security – Hash Function</i>. The equivalent standard used by other member-states of the CIS is GOST 34.311-95.<br><br>This function must not be confused with a different Streebog hash function, which is defined in the new revision of the standard GOST R 34.11-2012.<br><br>The GOST hash function is based on the GOST block cipher.";
    this.infoURL = "https://wikipedia.org/wiki/GOST_(hash_function)";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      {
        name: "Algorithm",
        type: "argSelector",
        value: [
          {
            name: "GOST 28147 (1994)",
            off: [1],
            on: [2],
          },
          {
            name: "GOST R 34.11 (Streebog, 2012)",
            on: [1],
            off: [2],
          },
        ],
      },
      {
        name: "Digest length",
        type: "option",
        value: ["256", "512"],
      },
      {
        name: "sBox",
        type: "option",
        value: [
          "E-TEST",
          "E-A",
          "E-B",
          "E-C",
          "E-D",
          "E-SC",
          "E-Z",
          "D-TEST",
          "D-A",
          "D-SC",
        ],
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const [version, length, sBox] = args;

    const versionNum = version === "GOST 28147 (1994)" ? 1994 : 2012;
    const algorithm: {
      name: string;
      version: number;
      mode: string;
      sBox?: unknown;
      length?: number;
    } = {
      name: versionNum === 1994 ? "GOST 28147" : "GOST R 34.10",
      version: versionNum,
      mode: "HASH",
    };

    if (versionNum === 1994) {
      algorithm.sBox = sBox;
    } else {
      algorithm.length = parseInt(length, 10);
    }

    try {
      const gostDigest = new GostDigest(algorithm);

      return toHexFast(gostDigest.digest(input));
    } catch (err) {
      throw new OperationError(
        err instanceof Error ? err.message : String(err),
      );
    }
  }
}

export default GOSTHash;
