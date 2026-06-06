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
import { OperationError } from "../errors/OperationError";

export class VarIntDecode extends Operation {
  constructor() {
    super();
    this.name = "VarInt Decode";
    this.module = "Default";
    this.description =
      "Decodes a Base128 variable-length integer (VarInt) as used in Protocol Buffers.";
    this.infoURL =
      "https://developers.google.com/protocol-buffers/docs/encoding#varints";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [];
  }

  run(input: ArrayBuffer, _args: unknown[]): string {
    const bytes = new Uint8Array(input);
    let result = BigInt(0);
    let shift = 0;
    let i = 0;
    while (i < bytes.length) {
      const byte = bytes[i++];
      result |= BigInt(byte & 0x7f) << BigInt(shift);
      shift += 7;
      if (!(byte & 0x80)) break;
      if (shift > 63) throw new OperationError("VarInt too long");
    }
    return result.toString();
  }
}

export default VarIntDecode;
