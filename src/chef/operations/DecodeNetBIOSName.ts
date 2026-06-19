/**
 * @fileoverview DecodeNetBIOSName operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";

/**
 * Decode NetBIOS Name operation
 *
 * @category Networking
 * @see https://wikipedia.org/wiki/NetBIOS
 * @see RFC 1001
 */
export class DecodeNetBIOSName extends TypedOperation<number[], number[], unknown[]> {
  /**
   * DecodeNetBIOSName constructor
   */
  constructor() {
    super();

    this.name = "Decode NetBIOS Name";
    this.module = "Default";
    this.description =
      "NetBIOS names as seen across the client interface to NetBIOS are exactly 16 bytes long. Within the NetBIOS-over-TCP protocols, a longer representation is used.<br><br>There are two levels of encoding. The first level maps a NetBIOS name into a domain system name.  The second level maps the domain system name into the 'compressed' representation required for interaction with the domain name system.<br><br>This operation decodes the first level of encoding. See RFC 1001 for full details.";
    this.infoURL = "https://wikipedia.org/wiki/NetBIOS";
    this.inputType = "byteArray";
    this.outputType = "byteArray";
    this.args = [
      {
        name: "Offset",
        type: "number",
        value: 65,
      },
    ];
    this.checks = [
      {
        pattern: "^\\s*\\S{32}$",
        flags: "",
        args: [65],
      },
    ];
  }

  /**
   * @param {number[]} input
   * @param {any[]} args
   * @returns {number[]}
   */
  run(input: number[], args: unknown[]): number[] {
    const [arg0] = args as [number];
    const output = [],
      offset = arg0;

    if (input.length <= 32 && input.length % 2 === 0) {
      for (let i = 0; i < input.length; i += 2) {
        output.push(
          (((input[i] & 0xff) - offset) << 4) |
            (((input[i + 1] & 0xff) - offset) & 0xf),
        );
      }
      for (let i = output.length - 1; i > 0; i--) {
        if (output[i] === 32) output.splice(i, i);
        else break;
      }
    }

    return output;
  }
}

export default DecodeNetBIOSName;
