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
import Utils from "../Utils";

/**
 * TCP/IP Checksum operation
 */
export class TCPIPChecksum extends Operation {
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
  run(input: any, args: any[]): any {
    input = new Uint8Array(input);
    let csum = 0;

    for (let i = 0; i < input.length; i++) {
      if (i % 2 === 0) {
        csum += input[i] << 8;
      } else {
        csum += input[i];
      }
    }

    csum = (csum >> 16) + (csum & 0xffff);

    return Utils.hex(0xffff - csum);
  }
}

export default TCPIPChecksum;
