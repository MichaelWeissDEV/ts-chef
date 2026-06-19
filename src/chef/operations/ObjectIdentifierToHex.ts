/**
 * @fileoverview ObjectIdentifierToHex operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import r from "jsrsasign";
import { TypedOperation, AnyInput } from "../Operation_new";

/**
 * Object Identifier to Hex operation
 */
export class ObjectIdentifierToHex extends TypedOperation<string, string, unknown[]> {
  /**
   * ObjectIdentifierToHex constructor
   */
  constructor() {
    super();

    this.name = "Object Identifier to Hex";
    this.module = "PublicKey";
    this.description =
      "Converts an object identifier (OID) into a hexadecimal string.";
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
    return r.KJUR.asn1.ASN1Util.oidIntToHex(input);
  }
}

export default ObjectIdentifierToHex;
