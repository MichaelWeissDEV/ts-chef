/**
 * @fileoverview MD4 operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation,  AnyInput  } from "../Operation_new";
import { runHash } from "../lib/Hash";

/**
 * MD4 operation
 */
export class MD4 extends TypedOperation<ArrayBuffer, AnyInput, unknown[]> {
  /**
   * MD4 constructor
   */
  constructor() {
    super();

    this.name = "MD4";
    this.module = "Crypto";
    this.description =
      "The MD4 (Message-Digest 4) algorithm is a cryptographic hash function developed by Ronald Rivest in 1990. The digest length is 128 bits. The algorithm has influenced later designs, such as the MD5, SHA-1 and RIPEMD algorithms.<br><br>The security of MD4 has been severely compromised.";
    this.infoURL = "https://wikipedia.org/wiki/MD4";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: ArrayBuffer, _args: unknown[]): AnyInput {
    return runHash("md4", input);
  }
}

export default MD4;
