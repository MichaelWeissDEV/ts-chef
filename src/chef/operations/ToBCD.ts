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
import { OperationError } from "../errors/OperationError";

export class ToBCD extends Operation {
  constructor() {
    super();
    this.name = "To BCD";
    this.module = "Default";
    this.description = "Converts a decimal number to Binary Coded Decimal.";
    this.infoURL = "https://wikipedia.org/wiki/Binary-coded_decimal";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Scheme",
        type: "option",
        value: [
          "8 4 2 1",
          "7 4 2 1",
          "4 2 2 1",
          "2 4 2 1",
          "Excess-3",
          "IBM 8 4 2 1",
        ],
      },
      { name: "Packed", type: "boolean", value: true },
      { name: "Signed", type: "boolean", value: false },
      { name: "Output format", type: "option", value: ["Binary", "Hex"] },
    ];
  }

  run(input: string, args: unknown[]): string {
    const scheme = args[0] as string;
    const packed = args[1] as boolean;
    const signed = args[2] as boolean;
    const format = args[3] as string;

    const digits = input.trim().replace(/[^0-9]/g, "");
    if (!digits) throw new OperationError("No valid digits found in input");

    const BCD_TABLE: Record<string, Record<string, string>> = {
      "8 4 2 1": {
        "0": "0000",
        "1": "0001",
        "2": "0010",
        "3": "0011",
        "4": "0100",
        "5": "0101",
        "6": "0110",
        "7": "0111",
        "8": "1000",
        "9": "1001",
      },
      "7 4 2 1": {
        "0": "0000",
        "1": "0001",
        "2": "0010",
        "3": "0011",
        "4": "0100",
        "5": "0101",
        "6": "0110",
        "7": "1000",
        "8": "1001",
        "9": "1010",
      },
      "4 2 2 1": {
        "0": "0000",
        "1": "0001",
        "2": "0010",
        "3": "0011",
        "4": "0100",
        "5": "0111",
        "6": "1000",
        "7": "1001",
        "8": "1110",
        "9": "1111",
      },
      "2 4 2 1": {
        "0": "0000",
        "1": "0001",
        "2": "0010",
        "3": "0011",
        "4": "0100",
        "5": "1011",
        "6": "1100",
        "7": "1101",
        "8": "1110",
        "9": "1111",
      },
      "Excess-3": {
        "0": "0011",
        "1": "0100",
        "2": "0101",
        "3": "0110",
        "4": "0111",
        "5": "1000",
        "6": "1001",
        "7": "1010",
        "8": "1011",
        "9": "1100",
      },
      "IBM 8 4 2 1": {
        "0": "0000",
        "1": "0001",
        "2": "0010",
        "3": "0011",
        "4": "0100",
        "5": "0101",
        "6": "0110",
        "7": "0111",
        "8": "1000",
        "9": "1001",
      },
    };
    const table = BCD_TABLE[scheme] ?? BCD_TABLE["8 4 2 1"];
    let bits = digits
      .split("")
      .map((d) => table[d])
      .join("");

    if (packed) {
      if (bits.length % 8 !== 0)
        bits = bits.padEnd(Math.ceil(bits.length / 8) * 8, "0");
    } else {
      bits = bits.replace(/(.{4})/g, "$1 ").trim();
    }

    void signed;

    if (format === "Hex") {
      const cleanBits = bits.replace(/ /g, "");
      const hex: string[] = [];
      for (let i = 0; i < cleanBits.length; i += 8) {
        hex.push(
          parseInt(cleanBits.slice(i, i + 8), 2)
            .toString(16)
            .padStart(2, "0"),
        );
      }
      return hex.join(" ");
    }

    return bits;
  }
}

export default ToBCD;
