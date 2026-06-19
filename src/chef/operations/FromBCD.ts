/**
 * @fileoverview FromBCD operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import Utils from "../Utils";
import OperationError from "../errors/OperationError";
import { ENCODING_SCHEME, ENCODING_LOOKUP, FORMAT } from "../lib/BCD";
import BigNumber from "bignumber.js";

/**
 * From BCD operation
 */
export class FromBCD extends TypedOperation<string, AnyInput, unknown[]> {
  /**
   * FromBCD constructor
   */
  constructor() {
    super();

    this.name = "From BCD";
    this.module = "Default";
    this.description =
      "Binary-Coded Decimal (BCD) is a class of binary encodings of decimal numbers where each decimal digit is represented by a fixed number of bits, usually four or eight. Special bit patterns are sometimes used for a sign.";
    this.infoURL = "https://wikipedia.org/wiki/Binary-coded_decimal";
    this.inputType = "string";
    this.outputType = "BigNumber";
    this.args = [
      {
        name: "Scheme",
        type: "option",
        value: ENCODING_SCHEME,
      },
      {
        name: "Packed",
        type: "boolean",
        value: true,
      },
      {
        name: "Signed",
        type: "boolean",
        value: false,
      },
      {
        name: "Input format",
        type: "option",
        value: FORMAT,
      },
    ];
    this.checks = [
      {
        pattern: "^(?:\\d{4} ){3,}\\d{4}$",
        flags: "",
        args: ["8 4 2 1", true, false, "Nibbles"],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {BigNumber}
   */
  run(input: string, args: unknown[]): AnyInput {
    const [arg0, arg1, arg2, arg3] = args as [string, boolean, boolean, string];
    const encoding = ENCODING_LOOKUP[arg0],
      packed = arg1,
      signed = arg2,
      inputFormat = arg3,
      nibbles = [];

    let output = "",
      byteArray;

    // Normalise the input
    switch (inputFormat) {
      case "Nibbles":
      case "Bytes":
        input = input.replace(/\s/g, "");
        for (let i = 0; i < input.length; i += 4) {
          nibbles.push(parseInt(input.substr(i, 4), 2));
        }
        break;
      case "Raw":
      default:
        byteArray = new Uint8Array(Utils.strToArrayBuffer(input));
        byteArray.forEach((b) => {
          nibbles.push(b >>> 4);
          nibbles.push(b & 15);
        });
        break;
    }

    if (!packed) {
      // Discard each high nibble
      for (let i = 0; i < nibbles.length; i++) {
        nibbles.splice(i, 1); // lgtm [js/loop-iteration-skipped-due-to-shifting]
      }
    }

    if (signed) {
      const sign = nibbles.pop();
      if (sign === 13 || sign === 11) {
        // Negative
        output += "-";
      }
    }

    nibbles.forEach((n) => {
      if (isNaN(n)) throw new OperationError("Invalid input");
      const val = encoding.indexOf(n);
      if (val < 0)
        throw new OperationError(
          `Value ${Utils.bin(n, 4)} is not in the encoding scheme`,
        );
      output += val.toString();
    });

    return new BigNumber(output);
  }
}

export default FromBCD;
