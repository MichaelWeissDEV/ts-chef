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
import Utils from "../Utils";

/**
 * ROT13 Brute Force operation.
 */
export class ROT13BruteForce extends Operation {
  /**
   * ROT13BruteForce constructor
   */
  constructor() {
    super();

    this.name = "ROT13 Brute Force";
    this.module = "Default";
    this.description =
      "Try all meaningful amounts for ROT13.<br><br>Optionally you can enter your known plaintext (crib) to filter the result.";
    this.infoURL = "https://wikipedia.org/wiki/ROT13";
    this.inputType = "byteArray";
    this.outputType = "string";
    this.args = [
      {
        name: "Rotate lower case chars",
        type: "boolean",
        value: true,
      },
      {
        name: "Rotate upper case chars",
        type: "boolean",
        value: true,
      },
      {
        name: "Rotate numbers",
        type: "boolean",
        value: false,
      },
      {
        name: "Sample length",
        type: "number",
        value: 100,
      },
      {
        name: "Sample offset",
        type: "number",
        value: 0,
      },
      {
        name: "Print amount",
        type: "boolean",
        value: true,
      },
      {
        name: "Crib (known plaintext string)",
        type: "string",
        value: "",
      },
    ];
  }

  /**
   * @param {byteArray} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const [
      rotateLower,
      rotateUpper,
      rotateNum,
      sampleLength,
      sampleOffset,
      printAmount,
      crib,
    ] = args;
    const sample = input.slice(sampleOffset, sampleOffset + sampleLength);
    const cribLower = crib.toLowerCase();
    const lowerStart = "a".charCodeAt(0),
      upperStart = "A".charCodeAt(0),
      numStart = "0".charCodeAt(0);
    const result = [];
    for (let amount = 1; amount < 26; amount++) {
      const rotated = sample.slice();
      for (let i = 0; i < rotated.length; i++) {
        if (
          rotateLower &&
          lowerStart <= rotated[i] &&
          rotated[i] < lowerStart + 26
        ) {
          rotated[i] = ((rotated[i] - lowerStart + amount) % 26) + lowerStart;
        } else if (
          rotateUpper &&
          upperStart <= rotated[i] &&
          rotated[i] < upperStart + 26
        ) {
          rotated[i] = ((rotated[i] - upperStart + amount) % 26) + upperStart;
        } else if (
          rotateNum &&
          numStart <= rotated[i] &&
          rotated[i] < numStart + 10
        ) {
          rotated[i] = ((rotated[i] - numStart + amount) % 10) + numStart;
        }
      }
      const rotatedString = Utils.byteArrayToUtf8(rotated);
      if (rotatedString.toLowerCase().indexOf(cribLower) >= 0) {
        const rotatedStringEscaped = Utils.escapeWhitespace(rotatedString);
        if (printAmount) {
          const amountStr = "Amount = " + (" " + amount).slice(-2) + ": ";
          result.push(amountStr + rotatedStringEscaped);
        } else {
          result.push(rotatedStringEscaped);
        }
      }
    }
    return result.join("\n");
  }
}

export default ROT13BruteForce;
