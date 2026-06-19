/**
 * @fileoverview XORChecksum operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";

export class XORChecksum extends TypedOperation<ArrayBuffer, string, unknown[]> {
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
