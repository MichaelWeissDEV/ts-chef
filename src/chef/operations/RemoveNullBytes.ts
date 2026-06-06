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
