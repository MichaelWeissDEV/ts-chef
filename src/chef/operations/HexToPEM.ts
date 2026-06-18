/**
 * @fileoverview HexToPEM operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import r from "jsrsasign";
import { Operation } from "../Operation";

/**
 * Hex to PEM operation
 */
export class HexToPEM extends Operation {
  /**
   * HexToPEM constructor
   */
  constructor() {
    super();

    this.name = "Hex to PEM";
    this.module = "PublicKey";
    this.description =
      "Converts a hexadecimal DER (Distinguished Encoding Rules) string into PEM (Privacy Enhanced Mail) format.";
    this.infoURL = "https://wikipedia.org/wiki/Privacy-Enhanced_Mail";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Header string",
        type: "string",
        value: "CERTIFICATE",
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, args: unknown[]): string {
    const [headerString] = args as [string];
    return r.KJUR.asn1.ASN1Util.getPEMStringFromHex(
      input.replace(/\s/g, ""),
      headerString,
    );
  }
}

export default HexToPEM;
