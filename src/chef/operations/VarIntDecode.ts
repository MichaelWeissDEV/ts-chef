/**
 * @fileoverview VarIntDecode operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";
import { OperationError } from "../errors/OperationError";

export class VarIntDecode extends TypedOperation<ArrayBuffer, string, unknown[]> {
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
