/**
 * @fileoverview MD5 operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation,  AnyInput  } from "../Operation_new";
import { runHash } from "../lib/Hash";

/**
 * MD5 operation
 */
export class MD5 extends TypedOperation<ArrayBuffer, AnyInput, unknown[]> {
  /**
   * MD5 constructor
   */
  constructor() {
    super();

    this.name = "MD5";
    this.module = "Crypto";
    this.description =
      "MD5 (Message-Digest 5) is a widely used hash function. It has been used in a variety of security applications and is also commonly used to check the integrity of files.<br><br>However, MD5 is not collision resistant and it isn't suitable for applications like SSL/TLS certificates or digital signatures that rely on this property.";
    this.infoURL = "https://wikipedia.org/wiki/MD5";
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
    return runHash("md5", input);
  }
}

export default MD5;
