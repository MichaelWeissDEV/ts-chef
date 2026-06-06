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
  run(input: any, args: any[]): any {
    const idn = args[0];

    if (idn) {
      return punycode.toUnicode(input);
    } else {
      return punycode.decode(input);
    }
  }
}

export default FromPunycode;
