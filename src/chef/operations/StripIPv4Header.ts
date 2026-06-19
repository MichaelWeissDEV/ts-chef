/**
 * @fileoverview StripIPv4Header operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import { OperationError } from "../errors/OperationError";
import { Stream } from "../lib/Stream";

export class StripIPv4Header extends TypedOperation<ArrayBuffer, ArrayBuffer, unknown[]> {
  constructor() {
    super();
    this.name = "Strip IPv4 header";
    this.module = "Default";
    this.description =
      "Strips the IPv4 header from an IPv4 packet, outputting the payload.";
    this.infoURL = "https://wikipedia.org/wiki/IPv4";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [];
  }

  run(input: ArrayBuffer, _args: unknown[]): ArrayBuffer {
    const MIN_HEADER_LEN = 20;
    const s = new Stream(new Uint8Array(input));
    if (s.length < MIN_HEADER_LEN) {
      throw new OperationError(
        "Input length is less than minimum IPv4 header length",
      );
    }
    const ihl = (s.readInt(1) as number) & 0x0f;
    const dataOffsetBytes = ihl * 4;
    if (s.length < dataOffsetBytes) {
      throw new OperationError("Input length is less than IHL");
    }
    s.moveTo(dataOffsetBytes);
    return (s.getBytes() as Uint8Array).buffer as ArrayBuffer;
  }
}

export default StripIPv4Header;
