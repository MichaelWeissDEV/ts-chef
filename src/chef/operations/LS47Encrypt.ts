/**
 * @fileoverview LS47Encrypt operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import * as LS47 from "../lib/LS47";

/**
 * LS47 Encrypt operation
 */
export class LS47Encrypt extends TypedOperation<string, string, unknown[]> {
  paddingSize: number = 0;

  /**
   * LS47Encrypt constructor
   */
  constructor() {
    super();

    this.name = "LS47 Encrypt";
    this.module = "Crypto";
    this.description =
      "This is a slight improvement of the ElsieFour cipher as described by Alan Kaminsky. We use 7x7 characters instead of original (barely fitting) 6x6, to be able to encrypt some structured information. We also describe a simple key-expansion algorithm, because remembering passwords is popular. Similar security considerations as with ElsieFour hold.<br>The LS47 alphabet consists of following characters: <code>_abcdefghijklmnopqrstuvwxyz.0123456789,-+*/:?!'()</code><br>A LS47 key is a permutation of the alphabet that is then represented in a 7x7 grid used for the encryption or decryption.";
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
      {
        name: "Signature",
        type: "string",
        value: "",
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, args: unknown[]): string {
    const [password, paddingSizeArg, signature] = args as [
      string,
      number,
      string,
    ];
    this.paddingSize = paddingSizeArg;

    LS47.initTiles();

    const key = LS47.deriveKey(password);
    return LS47.encryptPad(key, input, signature, paddingSizeArg);
  }
}

export default LS47Encrypt;
