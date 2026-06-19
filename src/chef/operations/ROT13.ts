/**
 * @fileoverview ROT13 operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, HighlightPos, HighlightResult } from "../Operation";

export class ROT13 extends TypedOperation<number[], number[], unknown[]> {
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
