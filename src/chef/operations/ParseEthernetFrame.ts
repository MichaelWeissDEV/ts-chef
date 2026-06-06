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
import OperationError from "../errors/OperationError";
import Utils from "../Utils";
import { fromHex, toHex } from "../lib/Hex";

/**
 * Parse Ethernet frame operation
 */
export class ParseEthernetFrame extends Operation {
  /**
   * ParseEthernetFrame constructor
   */
  constructor() {
    super();

    this.name = "Parse Ethernet frame";
    this.module = "Default";
    this.description =
      "Parses an Ethernet frame and either shows the deduced values (Source and destination MAC, VLANs) or returns the packet data.<br /><br />Good for use in conjunction with the Parse IPv4, and Parse TCP/UDP recipes.";
    this.infoURL =
      "https://en.wikipedia.org/wiki/Ethernet_frame#Frame_%E2%80%93_data_link_layer";
    this.inputType = "string";
    this.outputType = "html";
    this.args = [
      {
        name: "Input type",
        type: "option",
        value: ["Raw", "Hex"],
        defaultIndex: 0,
      },
      {
        name: "Return type",
        type: "option",
        value: ["Text output", "Packet data", "Packet data (hex)"],
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

    if (format === "Hex") {
      input = fromHex(input);
    } else if (format === "Raw") {
      input = new Uint8Array(Utils.strToArrayBuffer(input));
    } else {
      throw new OperationError("Invalid input format selected.");
    }

    const destinationMac = input.slice(0, 6);
    const sourceMac = input.slice(6, 12);

    let offset = 12;
    const vlans = [];

    while (offset < input.length) {
      const ethType = Utils.byteArrayToChars(input.slice(offset, offset + 2));
      offset += 2;

      if (ethType === "\x81\x00" || ethType === "\x88\xA8") {
        // Parse the VLAN tag:
        // [0000] 0000 0000 0000
        //  ^^^ PRIO  - Ignored
        //     ^ DEI  - Ignored
        //        ^^^^ ^^^^ ^^^^ VLAN ID
        const vlanTag = input.slice(offset, offset + 2);
        vlans.push(((vlanTag[0] & 0b00001111) << 8) | vlanTag[1]);

        offset += 2;
      } else {
        break;
      }
    }

    const packetData = input.slice(offset);

    if (outputFormat === "Packet data") {
      return Utils.byteArrayToChars(packetData);
    } else if (outputFormat === "Packet data (hex)") {
      return toHex(packetData);
    } else if (outputFormat === "Text output") {
      let retval = `Source MAC: ${toHex(sourceMac, ":")}\nDestination MAC: ${toHex(destinationMac, ":")}\n`;
      if (vlans.length > 0) {
        retval += `VLAN: ${vlans.join(", ")}\n`;
      }
      retval += `Data:\n${toHex(packetData)}`;
      return retval;
    }
  }
}

export default ParseEthernetFrame;
