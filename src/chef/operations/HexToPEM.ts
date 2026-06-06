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
  run(input: any, args: any[]): any {
    return r.KJUR.asn1.ASN1Util.getPEMStringFromHex(
      input.replace(/\s/g, ""),
      args[0],
    );
  }
}

export default HexToPEM;
