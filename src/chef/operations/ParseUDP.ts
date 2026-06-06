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
import Stream from "../lib/Stream";
import { toHexFast, fromHex } from "../lib/Hex";
import { objToTable } from "../lib/Protocol";
import Utils from "../Utils";
import OperationError from "../errors/OperationError";

/**
 * Parse UDP operation
 */
export class ParseUDP extends Operation {
  /**
   * ParseUDP constructor
   */
  constructor() {
    super();

    this.name = "Parse UDP";
    this.module = "Default";
    this.description = "Parses a UDP header and payload (if present).";
    this.infoURL = "https://wikipedia.org/wiki/User_Datagram_Protocol";
    this.inputType = "string";
    this.outputType = "json";
    this.presentType = "html";
    this.args = [
      {
        name: "Input format",
        type: "option",
        value: ["Hex", "Raw"],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {Object}
   */
  run(input: any, args: any[]): any {
    const format = args[0];

    if (format === "Hex") {
      input = fromHex(input);
    } else if (format === "Raw") {
      input = Utils.strToArrayBuffer(input);
    } else {
      throw new OperationError("Unrecognised input format.");
    }

    const s = new Stream(new Uint8Array(input));
    if (s.length < 8) {
      throw new OperationError("Need 8 bytes for a UDP Header");
    }

    // Parse Header
    const UDPPacket: Record<string, any> = {
      "Source port": s.readInt(2),
      "Destination port": s.readInt(2),
      Length: s.readInt(2),
      Checksum: "0x" + toHexFast(s.getBytes(2)!),
    };
    // Parse data if present
    if (s.hasMore()) {
      const length: number = UDPPacket["Length"] ?? 8;
      UDPPacket["Data"] = "0x" + toHexFast(s.getBytes(length - 8)!);
    }

    return UDPPacket;
  }

  /**
   * Displays the UDP Packet in a tabular style
   * @param {Object} data
   * @returns {html}
   */
  present(data: any) {
    return objToTable(data);
  }
}

export default ParseUDP;
