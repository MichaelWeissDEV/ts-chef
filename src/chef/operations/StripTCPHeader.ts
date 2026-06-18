/**
 * @fileoverview StripTCPHeader operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation } from "../Operation";
import { OperationError } from "../errors/OperationError";
import { Stream } from "../lib/Stream";

export class StripTCPHeader extends Operation {
  constructor() {
    super();
    this.name = "Strip TCP header";
    this.module = "Default";
    this.description =
      "Strips the TCP header from a TCP segment, outputting the payload.";
    this.infoURL = "https://wikipedia.org/wiki/Transmission_Control_Protocol";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [];
  }

  run(input: ArrayBuffer, _args: unknown[]): ArrayBuffer {
    const MIN_HEADER_LEN = 20;
    const DATA_OFFSET_OFFSET = 12;
    const DATA_OFFSET_LEN_BITS = 4;

    const s = new Stream(new Uint8Array(input));
    if (s.length < MIN_HEADER_LEN) {
      throw new OperationError("Need at least 20 bytes for a TCP Header");
    }
    s.moveTo(DATA_OFFSET_OFFSET);
    const dataOffsetWords = s.readBits(DATA_OFFSET_LEN_BITS) as number;
    const dataOffsetBytes = dataOffsetWords * 4;
    if (s.length < dataOffsetBytes) {
      throw new OperationError("Input length is less than data offset");
    }
    s.moveTo(dataOffsetBytes);
    return (s.getBytes() as Uint8Array).buffer as ArrayBuffer;
  }
}

export default StripTCPHeader;
