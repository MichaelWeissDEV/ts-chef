/**
 * @fileoverview Reverse operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";
import { Utils } from "../Utils";

export class Reverse extends TypedOperation<number[], number[], unknown[]> {
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
