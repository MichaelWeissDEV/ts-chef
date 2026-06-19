/**
 * @fileoverview StripUDPHeader operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";
import { OperationError } from "../errors/OperationError";
import { Stream } from "../lib/Stream";

export class StripUDPHeader extends TypedOperation<ArrayBuffer, ArrayBuffer, unknown[]> {
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
