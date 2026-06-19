/**
 * @fileoverview MD2 operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation,  AnyInput  } from "../Operation";
import { runHash } from "../lib/Hash";

/**
 * MD2 operation
 */
export class MD2 extends TypedOperation<ArrayBuffer, AnyInput, unknown[]> {
  /**
   * MD2 constructor
   */
  constructor() {
    super();

    this.name = "MD2";
    this.module = "Crypto";
    this.description =
      "The MD2 (Message-Digest 2) algorithm is a cryptographic hash function developed by Ronald Rivest in 1989. The algorithm is optimized for 8-bit computers.<br><br>Although MD2 is no longer considered secure, even as of 2014, it remains in use in public key infrastructures as part of certificates generated with MD2 and RSA. The message digest algorithm consists, by default, of 18 rounds.";
    this.infoURL = "https://wikipedia.org/wiki/MD2_(cryptography)";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      {
        name: "Rounds",
        type: "number",
        value: 18,
        min: 0,
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: ArrayBuffer, args: unknown[]): AnyInput {
    const [rounds] = args as [number];
    return runHash("md2", input, { rounds });
  }
}

export default MD2;
