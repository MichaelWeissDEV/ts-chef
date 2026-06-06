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
import { IP_DELIM_OPTIONS } from "../lib/Delim";
import {
  ipv6ToStr,
  genIpv6Mask,
  IPV4_REGEX,
  strToIpv6,
  ipv4ToStr,
  IPV6_REGEX,
  strToIpv4,
} from "../lib/IP";

/**
 * Group IP addresses operation
 */
export class GroupIPAddresses extends Operation {
  /**
   * GroupIPAddresses constructor
   */
  constructor() {
    super();

    this.name = "Group IP addresses";
    this.module = "Default";
    this.description =
      "Groups a list of IP addresses into subnets. Supports both IPv4 and IPv6 addresses.";
    this.infoURL = "https://wikipedia.org/wiki/Subnetwork";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Delimiter",
        type: "option",
        value: IP_DELIM_OPTIONS,
      },
      {
        name: "Subnet (CIDR)",
        type: "number",
        value: 24,
      },
      {
        name: "Only show the subnets",
        type: "boolean",
        value: false,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {any[]} args
   * @returns {string}
   */
  run(input: string, args: any[]): string {
    const delim = Utils.charRep(args[0]),
      cidr: number = args[1],
      onlySubnets: boolean = args[2],
      ipv4Mask = cidr < 32 ? ~(0xffffffff >>> cidr) : 0xffffffff,
      ipv6Mask = genIpv6Mask(cidr),
      ips = input.split(delim),
      ipv4Networks: { [key: number]: number[] } = {},
      ipv6Networks: { [key: string]: number[][] } = {};
    let match: RegExpExecArray | null = null,
      output = "",
      ip4: number = 0,
      ip6: number[] = [],
      network4: number = 0,
      networkStr = "",
      i: number;

    if (cidr < 0 || cidr > 127) {
      throw new OperationError(
        "CIDR must be less than 32 for IPv4 or 128 for IPv6",
      );
    }

    // Parse all IPs and add to network dictionary
    for (i = 0; i < ips.length; i++) {
      if ((match = IPV4_REGEX.exec(ips[i]))) {
        ip4 = (strToIpv4(match[1]) as number) >>> 0;
        network4 = ip4 & ipv4Mask;

        if (network4 in ipv4Networks) {
          ipv4Networks[network4].push(ip4);
        } else {
          ipv4Networks[network4] = [ip4];
        }
      } else if ((match = IPV6_REGEX.exec(ips[i]))) {
        ip6 = strToIpv6(match[1]) as number[];
        const networkArr: number[] = [];
        networkStr = "";

        for (let j = 0; j < 8; j++) {
          networkArr.push(ip6[j] & ipv6Mask[j]);
        }

        networkStr = ipv6ToStr(networkArr, true);

        if (networkStr in ipv6Networks) {
          ipv6Networks[networkStr].push(ip6);
        } else {
          ipv6Networks[networkStr] = [ip6];
        }
      }
    }

    // Sort IPv4 network dictionaries and print
    for (const net in ipv4Networks) {
      const netNum = parseInt(net, 10);
      ipv4Networks[netNum] = ipv4Networks[netNum].sort();

      output += ipv4ToStr(netNum) + "/" + cidr + "\n";

      if (!onlySubnets) {
        for (i = 0; i < ipv4Networks[netNum].length; i++) {
          output += "  " + ipv4ToStr(ipv4Networks[netNum][i]) + "\n";
        }
        output += "\n";
      }
    }

    // Sort IPv6 network dictionaries and print
    for (const netStr in ipv6Networks) {
      // ipv6Networks[netStr] = ipv6Networks[netStr].sort();  TODO

      output += netStr + "/" + cidr + "\n";

      if (!onlySubnets) {
        for (i = 0; i < ipv6Networks[netStr].length; i++) {
          output += "  " + ipv6ToStr(ipv6Networks[netStr][i], true) + "\n";
        }
        output += "\n";
      }
    }

    return output;
  }
}

export default GroupIPAddresses;
