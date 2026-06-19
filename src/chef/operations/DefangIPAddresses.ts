/**
 * @fileoverview DefangIPAddresses operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";

/**
 * Defang IP Addresses operation
 */
export class DefangIPAddresses extends TypedOperation<string, string, unknown[]> {
  /**
   * DefangIPAddresses constructor
   */
  constructor() {
    super();

    this.name = "Defang IP Addresses";
    this.module = "Default";
    this.description =
      "Takes a IPv4 or IPv6 address and 'Defangs' it, meaning the IP becomes invalid, removing the risk of accidentally utilising it as an IP address.";
    this.infoURL =
      "https://isc.sans.edu/forums/diary/Defang+all+the+things/22744/";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
    this.checks = [
      {
        pattern:
          "^\\s*(([0-9]{1,3}\\.){3}[0-9]{1,3}|([0-9a-f]{4}:){7}[0-9a-f]{4})\\s*$",
        flags: "i",
        args: [],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, _args: unknown[]): string {
    input = input.replace(IPV4_REGEX, (x) => {
      return x.replace(/\./g, "[.]");
    });

    input = input.replace(IPV6_REGEX, (x) => {
      return x.replace(/:/g, "[:]");
    });

    return input;
  }
}

export default DefangIPAddresses;

/**
 * IPV4 regular expression
 */
const IPV4_REGEX = new RegExp(
  "(?:(?:\\d|[01]?\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d|\\d)(?:\\/\\d{1,2})?",
  "g",
);

/**
 * IPV6 regular expression
 */
const IPV6_REGEX = new RegExp(
  "((?=.*::)(?!.*::.+::)(::)?([\\dA-Fa-f]{1,4}:(:|\\b)|){5}|([\\dA-Fa-f]{1,4}:){6})((([\\dA-Fa-f]{1,4}((?!\\3)::|:\\b|(?![\\dA-Fa-f])))|(?!\\2\\3)){2}|(((2[0-4]|1\\d|[1-9])?\\d|25[0-5])\\.?\\b){4})",
  "g",
);
