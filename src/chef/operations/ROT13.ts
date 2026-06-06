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

import { Operation, HighlightPos, HighlightResult } from "../Operation";

export class ROT13 extends Operation {
  constructor() {
    super();
    this.name = "ROT13";
    this.module = "Default";
    this.description =
      "A simple caesar substitution cipher which rotates alphabet characters by the specified amount (default 13).";
    this.infoURL = "https://wikipedia.org/wiki/ROT13";
    this.inputType = "byteArray";
    this.outputType = "byteArray";
    this.args = [
      { name: "Rotate lower case chars", type: "boolean", value: true },
      { name: "Rotate upper case chars", type: "boolean", value: true },
      { name: "Rotate numbers", type: "boolean", value: false },
      { name: "Amount", type: "number", value: 13 },
    ];
  }

  run(input: number[], args: unknown[]): number[] {
    const [rotLower, rotUpper, rotNums, rawAmount] = args as [
      boolean,
      boolean,
      boolean,
      number,
    ];
    const output = [...input];
    let amount = rawAmount;
    let amountNumbers = rawAmount;

    if (amount) {
      if (amount < 0) {
        amount = 26 - (Math.abs(amount) % 26);
        amountNumbers = 10 - (Math.abs(amountNumbers) % 10);
      }

      for (let i = 0; i < input.length; i++) {
        let chr = input[i];
        if (rotUpper && chr >= 65 && chr <= 90) {
          chr = (chr - 65 + amount) % 26;
          output[i] = chr + 65;
        } else if (rotLower && chr >= 97 && chr <= 122) {
          chr = (chr - 97 + amount) % 26;
          output[i] = chr + 97;
        } else if (rotNums && chr >= 48 && chr <= 57) {
          chr = (chr - 48 + amountNumbers) % 10;
          output[i] = chr + 48;
        }
      }
    }
    return output;
  }

  highlight(pos: HighlightPos, _args: unknown[]): HighlightResult {
    return pos;
  }

  highlightReverse(pos: HighlightPos, _args: unknown[]): HighlightResult {
    return pos;
  }
}

export default ROT13;
