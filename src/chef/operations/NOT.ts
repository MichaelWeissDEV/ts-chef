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
import { bitOp, not } from "../lib/BitwiseOp";

export class NOT extends Operation {
  constructor() {
    super();
    this.name = "NOT";
    this.module = "Default";
    this.description = "Returns the inverse of each byte.";
    this.infoURL = "https://wikipedia.org/wiki/Bitwise_operation#NOT";
    this.inputType = "ArrayBuffer";
    this.outputType = "byteArray";
    this.args = [];
  }

  run(input: ArrayBuffer, _args: unknown[]): number[] {
    return bitOp(Array.from(new Uint8Array(input)), null, not);
  }

  highlight(pos: HighlightPos, _args: unknown[]): HighlightResult {
    return pos;
  }

  highlightReverse(pos: HighlightPos, _args: unknown[]): HighlightResult {
    return pos;
  }
}

export default NOT;
