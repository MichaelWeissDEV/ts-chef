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
import { fromHex } from "../lib/Hex";
import { OperationError } from "../errors/OperationError";

export class HammingDistance extends Operation {
  constructor() {
    super();
    this.name = "Hamming Distance";
    this.module = "Default";
    this.description =
      "In information theory, the Hamming distance between two strings of equal length is the number of positions at which the corresponding symbols are different.";
    this.infoURL = "https://wikipedia.org/wiki/Hamming_distance";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Delimiter",
        type: "binaryShortString",
        value: "\\n\\n",
      },
      {
        name: "Unit",
        type: "option",
        value: ["Byte", "Bit"],
      },
      {
        name: "Input type",
        type: "option",
        value: ["Raw string", "Hex"],
      },
    ];
  }

  run(input: string, args: unknown[]): string {
    const delim = args[0] as string;
    const byByte = (args[1] as string) === "Byte";
    const inputType = args[2] as string;
    const samples = input.split(delim);

    if (samples.length !== 2) {
      throw new OperationError(
        "Error: You can only calculate the edit distance between 2 strings. Please ensure exactly two inputs are provided, separated by the specified delimiter.",
      );
    }

    if (samples[0].length !== samples[1].length) {
      throw new OperationError(
        "Error: Both inputs must be of the same length.",
      );
    }

    let a: Uint8Array;
    let b: Uint8Array;

    if (inputType === "Hex") {
      a = new Uint8Array(fromHex(samples[0]));
      b = new Uint8Array(fromHex(samples[1]));
    } else {
      a = new Uint8Array(Utils.strToArrayBuffer(samples[0]));
      b = new Uint8Array(Utils.strToArrayBuffer(samples[1]));
    }

    let dist = 0;

    for (let i = 0; i < a.length; i++) {
      if (byByte && a[i] !== b[i]) {
        dist++;
      } else if (!byByte) {
        let xord = a[i] ^ b[i];
        while (xord) {
          dist++;
          xord &= xord - 1;
        }
      }
    }

    return dist.toString();
  }
}

export default HammingDistance;
