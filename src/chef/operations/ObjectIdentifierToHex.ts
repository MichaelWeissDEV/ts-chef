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

import r from "jsrsasign";
import { Operation } from "../Operation";

/**
 * Object Identifier to Hex operation
 */
export class ObjectIdentifierToHex extends Operation {
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
  run(input: any, args: any[]): any {
    return r.KJUR.asn1.ASN1Util.oidIntToHex(input);
  }
}

export default ObjectIdentifierToHex;
