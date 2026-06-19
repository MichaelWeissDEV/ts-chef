/**
 * @fileoverview TCPIPChecksum operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import Utils from "../Utils";

/**
 * TCP/IP Checksum operation
 */
export class TCPIPChecksum extends TypedOperation<AnyInput, AnyInput, unknown[]> {
  /**
   * TCPIPChecksum constructor
   */
  constructor() {
    super();

    this.name = "TCP/IP Checksum";
    this.module = "Crypto";
    this.description =
      "Calculates the checksum for a TCP (Transport Control Protocol) or IP (Internet Protocol) header from an input of raw bytes.";
    this.infoURL = "https://wikipedia.org/wiki/IPv4_header_checksum";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: AnyInput, _args: unknown[]): AnyInput {
    const inputBytes = new Uint8Array(input as ArrayBuffer);
    let csum = 0;

    for (let i = 0; i < inputBytes.length; i++) {
      if (i % 2 === 0) {
        csum += inputBytes[i] << 8;
      } else {
        csum += inputBytes[i];
      }
    }

    csum = (csum >> 16) + (csum & 0xffff);

    return Utils.hex(0xffff - csum);
  }
}

export default TCPIPChecksum;
