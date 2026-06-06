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

export class XORChecksum extends Operation {
  constructor() {
    super();
    this.name = "XOR checksum";
    this.module = "Default";
    this.description =
      "XORs all the bytes in the input and returns the result.";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [];
  }

  run(input: ArrayBuffer, _args: unknown[]): string {
    const bytes = new Uint8Array(input);
    let checksum = 0;
    for (const b of bytes) checksum ^= b;
    return checksum.toString(16).padStart(2, "0");
  }
}

export default XORChecksum;
