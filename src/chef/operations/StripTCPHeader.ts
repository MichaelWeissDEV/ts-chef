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
