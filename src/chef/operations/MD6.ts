/**
 * @fileoverview MD6 operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation,  AnyInput  } from "../Operation_new";
import OperationError from "../errors/OperationError";
import NodeMD6 from "node-md6";

/**
 * MD6 operation
 */
export class MD6 extends TypedOperation<string, string, unknown[]> {
  /**
   * MD6 constructor
   */
  constructor() {
    super();

    this.name = "MD6";
    this.module = "Crypto";
    this.description =
      "The MD6 (Message-Digest 6) algorithm is a cryptographic hash function. It uses a Merkle tree-like structure to allow for immense parallel computation of hashes for very long inputs.";
    this.infoURL = "https://wikipedia.org/wiki/MD6";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Size",
        type: "number",
        value: 256,
      },
      {
        name: "Levels",
        type: "number",
        value: 64,
      },
      {
        name: "Key",
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
    const [size, levels, key] = args as [number, number, string];

    if (size < 0 || size > 512)
      throw new OperationError("Size must be between 0 and 512");
    if (levels < 0) throw new OperationError("Levels must be greater than 0");

    return (NodeMD6 as any)(input, size, key, levels);
  }
}

export default MD6;
