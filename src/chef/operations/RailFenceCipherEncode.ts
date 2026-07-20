/**
 * @fileoverview RailFenceCipherEncode operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import OperationError from "../errors/OperationError";

/**
 * Rail Fence Cipher Encode operation
 */
export class RailFenceCipherEncode extends TypedOperation<string, string, unknown[]> {
  /**
   * RailFenceCipherEncode constructor
   */
  constructor() {
    super();

    this.name = "Rail Fence Cipher Encode";
    this.module = "Ciphers";
    this.description =
      "Encodes Strings using the Rail fence Cipher provided a key and an offset";
    this.infoURL = "https://wikipedia.org/wiki/Rail_fence_cipher";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Key",
        type: "number",
        value: 2,
      },
      {
        name: "Offset",
        type: "number",
        value: 0,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, args: unknown[]): string {
    const [key, offset] = args as [number, number];

    const plaintext = input;
    if (key < 2) {
      throw new OperationError("Key has to be bigger than 2");
    } else if (key > plaintext.length) {
      throw new OperationError(
        "Key should be smaller than the plain text's length",
      );
    }

    if (offset < 0) {
      throw new OperationError("Offset has to be a positive integer");
    }

    const cycle = (key - 1) * 2;
    const rows = new Array(key).fill("");

    for (let pos = 0; pos < plaintext.length; pos++) {
      const rowIdx = key - 1 - Math.abs(cycle / 2 - ((pos + offset) % cycle));

      rows[rowIdx] += plaintext[pos];
    }

    return rows.join("");
  }
}

export default RailFenceCipherEncode;
