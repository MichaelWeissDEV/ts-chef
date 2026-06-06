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

export class Reverse extends Operation {
  constructor() {
    super();
    this.name = "Reverse";
    this.module = "Default";
    this.description = "Reverses the input string.";
    this.inputType = "byteArray";
    this.outputType = "byteArray";
    this.args = [
      {
        name: "By",
        type: "option",
        value: ["Byte", "Character", "Line"],
        defaultIndex: 1,
      },
    ];
  }

  run(input: number[], args: unknown[]): number[] {
    const by = args[0] as string;

    if (by === "Line") {
      const lines: number[][] = [];
      let line: number[] = [];
      for (let i = 0; i < input.length; i++) {
        if (input[i] === 0x0a) {
          lines.push(line);
          line = [];
        } else {
          line.push(input[i]);
        }
      }
      lines.push(line);
      lines.reverse();
      let result: number[] = [];
      for (const l of lines) {
        result = result.concat(l);
        result.push(0x0a);
      }
      return result.slice(0, input.length);
    } else if (by === "Character") {
      const inputString = Utils.byteArrayToUtf8(input);
      let result = "";
      for (let i = inputString.length - 1; i >= 0; i--) {
        const c = inputString.charCodeAt(i);
        if (i > 0 && 0xdc00 <= c && c <= 0xdfff) {
          const c2 = inputString.charCodeAt(i - 1);
          if (0xd800 <= c2 && c2 <= 0xdbff) {
            result += inputString.charAt(i - 1);
            result += inputString.charAt(i);
            i--;
            continue;
          }
        }
        result += inputString.charAt(i);
      }
      return Utils.strToUtf8ByteArray(result);
    } else {
      return [...input].reverse();
    }
  }
}

export default Reverse;
