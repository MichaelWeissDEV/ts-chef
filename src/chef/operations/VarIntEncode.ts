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

export class VarIntEncode extends Operation {
  constructor() {
    super();
    this.name = "VarInt Encode";
    this.module = "Default";
    this.description =
      "Encodes an integer to a Base128 variable-length integer (VarInt) as used in Protocol Buffers.";
    this.infoURL =
      "https://developers.google.com/protocol-buffers/docs/encoding#varints";
    this.inputType = "string";
    this.outputType = "ArrayBuffer";
    this.args = [];
  }

  run(input: string, _args: unknown[]): ArrayBuffer {
    let value: bigint;
    try {
      value = BigInt(input.trim());
    } catch {
      throw new OperationError("Invalid integer: " + input.trim());
    }
    if (value < BigInt(0)) {
      throw new OperationError("VarInt must be non-negative");
    }
    const bytes: number[] = [];
    do {
      let byte = Number(value & BigInt(0x7f));
      value >>= BigInt(7);
      if (value > BigInt(0)) byte |= 0x80;
      bytes.push(byte);
    } while (value > BigInt(0));
    return new Uint8Array(bytes).buffer as ArrayBuffer;
  }
}

export default VarIntEncode;
