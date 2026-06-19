/**
 * @fileoverview ParseEthernetFrame operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import OperationError from "../errors/OperationError";
import Utils from "../Utils";
import { fromHex, toHex } from "../lib/Hex";

/**
 * Parse Ethernet frame operation
 */
export class ParseEthernetFrame extends TypedOperation<string, AnyInput, unknown[]> {
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
  run(input: string, args: unknown[]): AnyInput {
    const [format, outputFormat] = args as [string, string];

    let bytes: number[];
    if (format === "Hex") {
      bytes = fromHex(input);
    } else if (format === "Raw") {
      bytes = Array.from(new Uint8Array(Utils.strToArrayBuffer(input)));
    } else {
      throw new OperationError("Invalid input format selected.");
    }

    const destinationMac = bytes.slice(0, 6);
    const sourceMac = bytes.slice(6, 12);

    let offset = 12;
    const vlans = [];

    while (offset < bytes.length) {
      const ethType = Utils.byteArrayToChars(bytes.slice(offset, offset + 2));
      offset += 2;

      if (ethType === "\x81\x00" || ethType === "\x88\xA8") {
        // Parse the VLAN tag:
        // [0000] 0000 0000 0000
        //  ^^^ PRIO  - Ignored
        //     ^ DEI  - Ignored
        //        ^^^^ ^^^^ ^^^^ VLAN ID
        const vlanTag = bytes.slice(offset, offset + 2);
        vlans.push(((vlanTag[0] & 0b00001111) << 8) | vlanTag[1]);

        offset += 2;
      } else {
        break;
      }
    }

    const packetData = bytes.slice(offset);

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
