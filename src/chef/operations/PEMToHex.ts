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

import { fromBase64 } from "../lib/Base64";
import { toHexFast } from "../lib/Hex";
import { Operation } from "../Operation";
import OperationError from "../errors/OperationError";

/**
 * PEM to Hex operation
 */
export class PEMToHex extends Operation {
  /**
   * PEMToHex constructor
   */
  constructor() {
    super();

    this.name = "PEM to Hex";
    this.module = "Default";
    this.description =
      "Converts PEM (Privacy Enhanced Mail) format to a hexadecimal DER (Distinguished Encoding Rules) string.";
    this.infoURL = "https://wikipedia.org/wiki/Privacy-Enhanced_Mail#Format";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
    this.checks = [
      {
        pattern: "----BEGIN ([A-Z][A-Z ]+[A-Z])-----",
        flags: "",
        args: [],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const output = [];
    let match;
    const regex = /-----BEGIN ([A-Z][A-Z ]+[A-Z])-----/g;
    while ((match = regex.exec(input)) !== null) {
      // find corresponding end tag
      const indexBase64 = match.index + match[0].length;
      const footer = `-----END ${match[1]}-----`;
      const indexFooter = input.indexOf(footer, indexBase64);
      if (indexFooter === -1) {
        throw new OperationError(`PEM footer '${footer}' not found`);
      }

      // decode base64 content
      const base64 = input.substring(indexBase64, indexFooter);
      const bytes = fromBase64(
        base64,
        "A-Za-z0-9+/=",
        "byteArray",
        true,
      ) as number[];
      const hex = toHexFast(bytes);
      output.push(hex);
    }
    return output.join("\n");
  }
}

export default PEMToHex;
