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
import { toBinary } from "../lib/Binary";
import { objToTable, bytesToLargeNumber } from "../lib/Protocol";
import { Utils } from "../Utils";
import OperationError from "../errors/OperationError";
import BigNumber from "bignumber.js";

/**
 * Parse TCP operation
 */
export class ParseTCP extends Operation {
  /**
   * ParseTCP constructor
   */
  constructor() {
    super();

    this.name = "Parse TCP";
    this.module = "Default";
    this.description = "Parses a TCP header and payload (if present).";
    this.infoURL = "https://wikipedia.org/wiki/Transmission_Control_Protocol";
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
   * @param {any[]} args
   * @returns {any}
   */
  run(input: string, args: any[]): any {
    const format = args[0];
    let inputBuffer: ArrayBuffer;

    if (format === "Hex") {
      inputBuffer = new Uint8Array(fromHex(input)).buffer as ArrayBuffer;
    } else if (format === "Raw") {
      inputBuffer = Utils.strToArrayBuffer(input);
    } else {
      throw new OperationError("Unrecognised input format.");
    }

    const s = new Stream(new Uint8Array(inputBuffer));
    if (s.length < 20) {
      throw new OperationError("Need at least 20 bytes for a TCP Header");
    }

    // Parse Header
    const TCPPacket: { [key: string]: any } = {
      "Source port": s.readInt(2),
      "Destination port": s.readInt(2),
      "Sequence number": bytesToLargeNumber(s.getBytes(4)!),
      "Acknowledgement number": s.readInt(4),
      "Data offset": s.readBits(4),
      Flags: {
        Reserved: toBinary(s.readBits(3)!, "", 3),
        NS: s.readBits(1),
        CWR: s.readBits(1),
        ECE: s.readBits(1),
        URG: s.readBits(1),
        ACK: s.readBits(1),
        PSH: s.readBits(1),
        RST: s.readBits(1),
        SYN: s.readBits(1),
        FIN: s.readBits(1),
      },
      "Window size": s.readInt(2),
      Checksum: "0x" + toHexFast(s.getBytes(2)!),
      "Urgent pointer": "0x" + toHexFast(s.getBytes(2)!),
    };

    // Parse options if present
    let windowScaleShift = 0;
    if (TCPPacket["Data offset"] > 5) {
      let remainingLength = TCPPacket["Data offset"] * 4 - 20;

      const options: { [key: string]: any } = {};
      while (remainingLength > 0) {
        const kind = s.readInt(1)!;
        const option: { [key: string]: any } = {
          Kind: kind,
        };

        let opt: {
          name: string;
          length: boolean;
          parser?: (data: Uint8Array) => any;
        } = { name: "Reserved", length: true };
        if (
          Object.prototype.hasOwnProperty.call(TCP_OPTION_KIND_LOOKUP, kind)
        ) {
          opt = TCP_OPTION_KIND_LOOKUP[kind];
        }

        // Add Length and Value fields
        if (opt.length) {
          option.Length = s.readInt(1);

          if (option.Length > 2) {
            if (opt.parser) {
              option.Value = opt.parser(s.getBytes(option.Length - 2)!);
            } else {
              option.Value =
                option.Length <= 6
                  ? s.readInt(option.Length - 2)
                  : "0x" + toHexFast(s.getBytes(option.Length - 2)!);
            }

            // Store Window Scale shift for later
            if (
              kind === 3 &&
              option.Value &&
              typeof option.Value === "object"
            ) {
              windowScaleShift = (option.Value as any)["Shift count"];
            }
          }
        }
        options[opt.name] = option;

        const length = option.Length || 1;
        remainingLength -= length;
      }
      TCPPacket.Options = options;
    }

    if (s.hasMore()) {
      TCPPacket.Data = "0x" + toHexFast(s.getBytes()!);
    }

    // Improve values
    const dataOffset = TCPPacket["Data offset"];
    TCPPacket["Data offset"] = `${dataOffset} (${dataOffset * 4} bytes)`;
    const trueWndSize = new BigNumber(TCPPacket["Window size"]).multipliedBy(
      new BigNumber(2).pow(new BigNumber(windowScaleShift)),
    );
    TCPPacket["Window size"] =
      `${TCPPacket["Window size"]} (Scaled: ${trueWndSize})`;

    return TCPPacket;
  }

  /**
   * Displays the TCP Packet in a tabular style
   * @param {any} data
   * @returns {string}
   */
  present(data: any): string {
    return objToTable(data);
  }
}

// Taken from https://www.iana.org/assignments/tcp-parameters/tcp-parameters.xhtml
// on 2022-05-30
const TCP_OPTION_KIND_LOOKUP: Record<
  number,
  { name: string; length: boolean; parser?: (data: Uint8Array) => any }
> = {
  0: { name: "End of Option List", length: false },
  1: { name: "No-Operation", length: false },
  2: { name: "Maximum Segment Size", length: true },
  3: { name: "Window Scale", length: true, parser: windowScaleParser },
  4: { name: "SACK Permitted", length: true },
  5: { name: "SACK", length: true },
  6: { name: "Echo (obsoleted by option 8)", length: true },
  7: { name: "Echo Reply (obsoleted by option 8)", length: true },
  8: { name: "Timestamps", length: true, parser: tcpTimestampParser },
  9: { name: "Partial Order Connection Permitted (obsolete)", length: true },
  10: { name: "Partial Order Service Profile (obsolete)", length: true },
  11: { name: "CC (obsolete)", length: true },
  12: { name: "CC.NEW (obsolete)", length: true },
  13: { name: "CC.ECHO (obsolete)", length: true },
  14: {
    name: "TCP Alternate Checksum Request (obsolete)",
    length: true,
    parser: tcpAlternateChecksumParser,
  },
  15: { name: "TCP Alternate Checksum Data (obsolete)", length: true },
  16: { name: "Skeeter", length: true },
  17: { name: "Bubba", length: true },
  18: { name: "Trailer Checksum Option", length: true },
  19: { name: "MD5 Signature Option (obsoleted by option 29)", length: true },
  20: { name: "SCPS Capabilities", length: true },
  21: { name: "Selective Negative Acknowledgements", length: true },
  22: { name: "Record Boundaries", length: true },
  23: { name: "Corruption experienced", length: true },
  24: { name: "SNAP", length: true },
  25: { name: "Unassigned (released 2000-12-18)", length: true },
  26: { name: "TCP Compression Filter", length: true },
  27: { name: "Quick-Start Response", length: true },
  28: {
    name: "User Timeout Option (also, other known unauthorized use)",
    length: true,
  },
  29: { name: "TCP Authentication Option (TCP-AO)", length: true },
  30: { name: "Multipath TCP (MPTCP)", length: true },
  69: { name: "Encryption Negotiation (TCP-ENO)", length: true },
  70: {
    name: "Reserved (known unauthorized use without proper IANA assignment)",
    length: true,
  },
  76: {
    name: "Reserved (known unauthorized use without proper IANA assignment)",
    length: true,
  },
  77: {
    name: "Reserved (known unauthorized use without proper IANA assignment)",
    length: true,
  },
  78: {
    name: "Reserved (known unauthorized use without proper IANA assignment)",
    length: true,
  },
  253: {
    name: "RFC3692-style Experiment 1 (also improperly used for shipping products) ",
    length: true,
  },
  254: {
    name: "RFC3692-style Experiment 2 (also improperly used for shipping products) ",
    length: true,
  },
};

/**
 * Parses the TCP Alternate Checksum Request field
 * @param {Uint8Array} data
 * @returns {string}
 */
function tcpAlternateChecksumParser(data: Uint8Array): string {
  const lookupMap: Record<number, string> = {
    0: "TCP Checksum",
    1: "8-bit Fletchers's algorithm",
    2: "16-bit Fletchers's algorithm",
    3: "Redundant Checksum Avoidance",
  };
  const lookup = lookupMap[data[0]] ?? "Unknown";

  return `${lookup} (0x${toHexFast(data)})`;
}

/**
 * Parses the TCP Timestamp field
 * @param {Uint8Array} data
 * @returns {any}
 */
function tcpTimestampParser(data: Uint8Array): any {
  const s = new Stream(data);

  if (s.length !== 8)
    return `Error: Timestamp field should be 8 bytes long (received 0x${toHexFast(data)})`;

  const tsval = bytesToLargeNumber(s.getBytes(4)!),
    tsecr = bytesToLargeNumber(s.getBytes(4)!);

  return {
    "Current Timestamp": tsval,
    "Echo Reply": tsecr,
  };
}

/**
 * Parses the Window Scale field
 * @param {Uint8Array} data
 * @returns {any}
 */
function windowScaleParser(data: Uint8Array): any {
  if (data.length !== 1)
    return `Error: Window Scale should be one byte long (received 0x${toHexFast(data)})`;

  return {
    "Shift count": data[0],
    Multiplier: 1 << data[0],
  };
}

export default ParseTCP;
