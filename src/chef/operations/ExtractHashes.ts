/**
 * @fileoverview ExtractHashes operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, AnyInput } from "../Operation";
import { search } from "../lib/Extract";

/**
 * Extract Hash Values operation
 */
export class ExtractHashes extends Operation {
  /**
   * ExtractHashValues constructor
   */
  constructor() {
    super();

    this.name = "Extract hashes";
    this.module = "Regex";
    this.description =
      "Extracts potential hashes based on hash character length";
    this.infoURL =
      "https://wikipedia.org/wiki/Comparison_of_cryptographic_hash_functions";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Hash character length",
        type: "number",
        value: 40,
      },
      {
        name: "All hashes",
        type: "boolean",
        value: false,
      },
      {
        name: "Display Total",
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
  run(input: string, args: unknown[]): AnyInput {
    const [hashLength, searchAllHashes, showDisplayTotal] = args as [
      number,
      boolean,
      boolean,
    ];
    const results = [];
    let hashCount = 0;

    // Convert character length to bit length
    let hashBitLengths = [(hashLength / 2) * 8];

    if (searchAllHashes)
      hashBitLengths = [
        4, 8, 16, 32, 64, 128, 160, 192, 224, 256, 320, 384, 512, 1024,
      ];

    for (const hashBitLength of hashBitLengths) {
      // Convert bit length to character length
      const hashCharacterLength = (hashBitLength / 8) * 2;

      const regex = new RegExp(
        `(\\b|^)[a-f0-9]{${hashCharacterLength}}(\\b|$)`,
        "g",
      );
      const searchResults = search(input, regex, null, null);

      hashCount += searchResults.length;
      results.push(...searchResults);
    }

    let output = "";
    if (showDisplayTotal) {
      output = `Total Results: ${hashCount}\n\n`;
    }

    output = output + results.join("\n");
    return output;
  }
}

export default ExtractHashes;
