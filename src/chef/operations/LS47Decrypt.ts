/**
 * @fileoverview LS47Decrypt operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import Operation from "../Operation";
import * as LS47 from "../lib/LS47";

/**
 * LS47 Decrypt operation
 */
export class LS47Decrypt extends Operation {
  paddingSize: number = 0;

  /**
   * LS47Decrypt constructor
   */
  constructor() {
    super();

    this.name = "LS47 Decrypt";
    this.module = "Crypto";
    this.description =
      "This is a slight improvement of the ElsieFour cipher as described by Alan Kaminsky. We use 7x7 characters instead of original (barely fitting) 6x6, to be able to encrypt some structured information. We also describe a simple key-expansion algorithm, because remembering passwords is popular. Similar security considerations as with ElsieFour hold.<br>The LS47 alphabet consists of following characters: <code>_abcdefghijklmnopqrstuvwxyz.0123456789,-+*/:?!'()</code><br>An LS47 key is a permutation of the alphabet that is then represented in a 7x7 grid used for the encryption or decryption.";
    this.infoURL = "https://github.com/exaexa/ls47";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Password",
        type: "string",
        value: "",
      },
      {
        name: "Padding",
        type: "number",
        value: 10,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, args: unknown[]): string {
    const [password, paddingSizeArg] = args as [string, number];
    this.paddingSize = paddingSizeArg;

    LS47.initTiles();

    const key = LS47.deriveKey(password);
    return LS47.decryptPad(key, input, paddingSizeArg);
  }
}

export default LS47Decrypt;
