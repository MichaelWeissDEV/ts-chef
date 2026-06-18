/**
 * @fileoverview HexToObjectIdentifier operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import r from "jsrsasign";
import { Operation } from "../Operation";

/**
 * Hex to Object Identifier operation
 */
export class HexToObjectIdentifier extends Operation {
  /**
   * HexToObjectIdentifier constructor
   */
  constructor() {
    super();

    this.name = "Hex to Object Identifier";
    this.module = "PublicKey";
    this.description =
      "Converts a hexadecimal string into an object identifier (OID).";
    this.infoURL = "https://wikipedia.org/wiki/Object_identifier";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, _args: unknown[]): string {
    return r.KJUR.asn1.ASN1Util.oidHexToInt(input.replace(/\s/g, ""));
  }
}

export default HexToObjectIdentifier;
