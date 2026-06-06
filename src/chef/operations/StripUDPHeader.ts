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

export class StripUDPHeader extends Operation {
  constructor() {
    super();
    this.name = "Strip UDP header";
    this.module = "Default";
    this.description =
      "Strips the UDP header from a UDP datagram, outputting the payload.";
    this.infoURL = "https://wikipedia.org/wiki/User_Datagram_Protocol";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [];
  }

  run(input: ArrayBuffer, _args: unknown[]): ArrayBuffer {
    const HEADER_LEN = 8;
    const s = new Stream(new Uint8Array(input));
    if (s.length < HEADER_LEN) {
      throw new OperationError("Need 8 bytes for a UDP Header");
    }
    s.moveTo(HEADER_LEN);
    return (s.getBytes() as Uint8Array).buffer as ArrayBuffer;
  }
}

export default StripUDPHeader;
