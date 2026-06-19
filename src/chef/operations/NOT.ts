/**
 * @fileoverview NOT operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, HighlightPos, HighlightResult } from "../Operation";
import { bitOp, not } from "../lib/BitwiseOp";

export class NOT extends TypedOperation<ArrayBuffer, number[], unknown[]> {
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
