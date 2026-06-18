/**
 * @fileoverview ParseASN1HexString operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import r from "jsrsasign";
import { Operation, AnyInput } from "../Operation";

/**
 * Parse ASN.1 hex string operation
 */
export class ParseASN1HexString extends Operation {
  /**
   * ParseASN1HexString constructor
   */
  constructor() {
    super();

    this.name = "Parse ASN.1 hex string";
    this.module = "PublicKey";
    this.description =
      "Abstract Syntax Notation One (ASN.1) is a standard and notation that describes rules and structures for representing, encoding, transmitting, and decoding data in telecommunications and computer networking.<br><br>This operation parses arbitrary ASN.1 data (encoded as an hex string: use the 'To Hex' operation if necessary) and presents the resulting tree.";
    this.infoURL = "https://wikipedia.org/wiki/Abstract_Syntax_Notation_One";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Starting index",
        type: "number",
        value: 0,
      },
      {
        name: "Truncate octet strings longer than",
        type: "number",
        value: 32,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, args: unknown[]): string {
    const [index, truncateLen] = args as [number, number];
    return r.ASN1HEX.dump(
      input.replace(/\s/g, "").toLowerCase(),
      {
        ommit_long_octet: truncateLen,
      },
      index,
    );
  }
}

export default ParseASN1HexString;
