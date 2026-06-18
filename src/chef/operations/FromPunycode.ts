/**
 * @fileoverview FromPunycode operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, AnyInput } from "../Operation";
import punycode from "punycode.js";

/**
 * From Punycode operation
 */
export class FromPunycode extends Operation {
  /**
   * FromPunycode constructor
   */
  constructor() {
    super();

    this.name = "From Punycode";
    this.module = "Encodings";
    this.description =
      "Punycode is a way to represent Unicode with the limited character subset of ASCII supported by the Domain Name System.<br><br>e.g. <code>mnchen-3ya</code> decodes to <code>m\xfcnchen</code>";
    this.infoURL = "https://wikipedia.org/wiki/Punycode";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Internationalised domain name",
        type: "boolean",
        value: false,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, args: unknown[]): AnyInput {
    const idn = args[0];

    if (idn) {
      return punycode.toUnicode(input);
    } else {
      return punycode.decode(input);
    }
  }
}

export default FromPunycode;
