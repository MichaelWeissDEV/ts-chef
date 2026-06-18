/**
 * @fileoverview ROT47 operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, HighlightPos, HighlightResult } from "../Operation";

export class ROT47 extends Operation {
  constructor() {
    super();
    this.name = "ROT47";
    this.module = "Default";
    this.description =
      "A slightly more complex variation of a caesar cipher, which includes ASCII characters from 33 '!' to 126 '~'. Default rotation: 47.";
    this.infoURL = "https://wikipedia.org/wiki/ROT13#Variants";
    this.inputType = "byteArray";
    this.outputType = "byteArray";
    this.args = [{ name: "Amount", type: "number", value: 47 }];
  }

  run(input: number[], args: unknown[]): number[] {
    const output = [...input];
    let amount = args[0] as number;

    if (amount) {
      if (amount < 0) {
        amount = 94 - (Math.abs(amount) % 94);
      }
      for (let i = 0; i < input.length; i++) {
        let chr = input[i];
        if (chr >= 33 && chr <= 126) {
          chr = (chr - 33 + amount) % 94;
          output[i] = chr + 33;
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

export default ROT47;
