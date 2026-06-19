/**
 * @fileoverview HammingDistance operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";
import { Utils } from "../Utils";
import { fromHex } from "../lib/Hex";
import { OperationError } from "../errors/OperationError";

export class HammingDistance extends TypedOperation<string, string, unknown[]> {
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
