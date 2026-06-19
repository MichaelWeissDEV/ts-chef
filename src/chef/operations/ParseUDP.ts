/**
 * @fileoverview ParseUDP operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import Stream from "../lib/Stream";
import { toHexFast, fromHex } from "../lib/Hex";
import { objToTable } from "../lib/Protocol";
import Utils from "../Utils";
import OperationError from "../errors/OperationError";

/**
 * Parse UDP operation
 */
export class ParseUDP extends TypedOperation<string, AnyInput, unknown[]> {
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
  run(input: string, args: unknown[]): AnyInput {
    const [format] = args as [string];

    let rawBytes: number[] | ArrayBuffer;
    if (format === "Hex") {
      rawBytes = fromHex(input);
    } else if (format === "Raw") {
      rawBytes = Utils.strToArrayBuffer(input);
    } else {
      throw new OperationError("Unrecognised input format.");
    }

    const s = new Stream(new Uint8Array(rawBytes));
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
  present(data: AnyInput, _args: unknown[]): AnyInput {
    return objToTable(data);
  }
}

export default ParseUDP;
