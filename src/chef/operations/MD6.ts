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

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import NodeMD6 from "node-md6";

/**
 * MD6 operation
 */
export class MD6 extends Operation {
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
  run(input: any, args: any[]): any {
    const [size, levels, key] = args;

    if (size < 0 || size > 512)
      throw new OperationError("Size must be between 0 and 512");
    if (levels < 0) throw new OperationError("Levels must be greater than 0");

    return (NodeMD6 as any)(input, size, key, levels);
  }
}

export default MD6;
