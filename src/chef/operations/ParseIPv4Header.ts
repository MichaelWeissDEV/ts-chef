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
import OperationError from "../errors/OperationError";
import { fromHex, toHex } from "../lib/Hex";
import { ipv4ToStr, protocolLookup } from "../lib/IP";
import TCPIPChecksum from "./TCPIPChecksum";

/**
 * Parse IPv4 header operation
 */
export class ParseIPv4Header extends Operation {
  /**
   * ParseIPv4Header constructor
   */
  constructor() {
    super();

    this.name = "Parse IPv4 header";
    this.module = "Default";
    this.description =
      "Given an IPv4 header, this operations parses and displays each field in an easily readable format.";
    this.infoURL = "https://wikipedia.org/wiki/IPv4#Header";
    this.inputType = "string";
    this.outputType = "html";
    this.args = [
      {
        name: "Input format",
        type: "option",
        value: ["Hex", "Raw"],
      },
      {
        name: "Output format",
        type: "option",
        value: ["Table", "Data (hex)", "Data (raw)"],
        defaultIndex: 0,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {html}
   */
  run(input: any, args: any[]): any {
    const format = args[0];
    const outputFormat = args[1];

    let output;

    if (format === "Hex") {
      input = fromHex(input);
    } else if (format === "Raw") {
      input = new Uint8Array(Utils.strToArrayBuffer(input));
    } else {
      throw new OperationError("Unrecognised input format.");
    }

    const ihlNum: number = input[0] & 0x0f;
    let ihl: number | string = ihlNum;
    const dscp = (input[1] >>> 2) & 0x3f,
      ecn = input[1] & 0x03,
      length = (input[2] << 8) | input[3],
      identification = (input[4] << 8) | input[5],
      flags = (input[6] >>> 5) & 0x07,
      fragOffset = ((input[6] & 0x1f) << 8) | input[7],
      ttl = input[8],
      protocol = input[9],
      checksum = (input[10] << 8) | input[11],
      srcIP =
        (input[12] << 24) | (input[13] << 16) | (input[14] << 8) | input[15],
      dstIP =
        (input[16] << 24) | (input[17] << 16) | (input[18] << 8) | input[19],
      checksumHeader = input
        .slice(0, 10)
        .concat([0, 0])
        .concat(input.slice(12, 20));
    let version: number | string = (input[0] >>> 4) & 0x0f,
      options: number[] = [];

    // Version
    if (version !== 4) {
      version =
        version + " (Error: for IPv4 headers, this should always be set to 4)";
    }

    // IHL
    if (ihlNum < 5) {
      ihl = ihlNum + " (Error: this should always be at least 5)";
    } else if (ihlNum > 5) {
      // sort out options...
      const optionsLen = ihlNum * 4 - 20;
      options = input.slice(20, optionsLen + 20);
    }

    // Protocol
    const protocolInfo = protocolLookup[protocol] || {
      keyword: "",
      protocol: "",
    };

    // Checksum
    const correctChecksum = new TCPIPChecksum().run(checksumHeader, []),
      givenChecksum = Utils.hex(checksum);
    let checksumResult;
    if (correctChecksum === givenChecksum) {
      checksumResult = givenChecksum + " (correct)";
    } else {
      checksumResult =
        givenChecksum + " (incorrect, should be " + correctChecksum + ")";
    }

    const data = input.slice(ihlNum * 4);

    if (outputFormat === "Table") {
      output = `<table class='table table-hover table-sm table-bordered table-nonfluid'><tr><th>Field</th><th>Value</th></tr>
<tr><td>Version</td><td>${version}</td></tr>
<tr><td>Internet Header Length (IHL)</td><td>${ihl} (${ihlNum * 4} bytes)</td></tr>
<tr><td>Differentiated Services Code Point (DSCP)</td><td>${dscp}</td></tr>
<tr><td>Explicit Congestion Notification (ECN)</td><td>${ecn}</td></tr>
<tr><td>Total length</td><td>${length} bytes
  IP header: ${ihlNum * 4} bytes
  Data: ${length - ihlNum * 4} bytes</td></tr>
<tr><td>Identification</td><td>0x${Utils.hex(identification)} (${identification})</td></tr>
<tr><td>Flags</td><td>0x${Utils.hex(flags, 2)}
  Reserved bit:${flags >> 2} (must be 0)
  Don't fragment:${(flags >> 1) & 1}
  More fragments:${flags & 1}</td></tr>
<tr><td>Fragment offset</td><td>${fragOffset}</td></tr>
<tr><td>Time-To-Live</td><td>${ttl}</td></tr>
<tr><td>Protocol</td><td>${protocol}, ${protocolInfo.protocol} (${protocolInfo.keyword})</td></tr>
<tr><td>Header checksum</td><td>${checksumResult}</td></tr>
<tr><td>Source IP address</td><td>${ipv4ToStr(srcIP)}</td></tr>
<tr><td>Destination IP address</td><td>${ipv4ToStr(dstIP)}</td></tr>
<tr><td>Data (hex)</td><td>${toHex(data)}</td></tr>`;

      if (ihlNum > 5) {
        output += `<tr><td>Options</td><td>${toHex(options)}</td></tr>`;
      }

      return output + "</table>";
    } else if (outputFormat === "Data (hex)") {
      return toHex(data);
    } else if (outputFormat === "Data (raw)") {
      return Utils.byteArrayToChars(data);
    }
  }
}

export default ParseIPv4Header;
