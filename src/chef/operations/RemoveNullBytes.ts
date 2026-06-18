/**
 * @fileoverview RemoveNullBytes operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation } from "../Operation";

export class RemoveNullBytes extends Operation {
  constructor() {
    super();
    this.name = "Remove null bytes";
    this.module = "Default";
    this.description =
      "Removes all null bytes (<code>0x00</code>) from the input.";
    this.inputType = "ArrayBuffer";
    this.outputType = "byteArray";
    this.args = [];
  }

  run(input: ArrayBuffer, _args: unknown[]): number[] {
    const arr = new Uint8Array(input);
    const output: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== 0) output.push(arr[i]);
    }
    return output;
  }
}

export default RemoveNullBytes;
