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
