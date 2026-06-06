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

export class StripIPv4Header extends Operation {
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
