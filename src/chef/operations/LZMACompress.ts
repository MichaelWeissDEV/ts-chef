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

import { compress } from "@blu3r4y/lzma";

/**
 * LZMA Compress operation
 */
export class LZMACompress extends Operation {
  /**
   * LZMACompress constructor
   */
  constructor() {
    super();

    this.name = "LZMA Compress";
    this.module = "Compression";
    this.description =
      "Compresses data using the Lempel\u2013Ziv\u2013Markov chain algorithm. Compression mode determines the speed and effectiveness of the compression: 1 is fastest and less effective, 9 is slowest and most effective";
    this.infoURL =
      "https://wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Markov_chain_algorithm";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [
      {
        name: "Compression Mode",
        type: "option",
        value: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
        defaultIndex: 6,
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {ArrayBuffer}
   */
  async run(input: any, args: any[]): Promise<any> {
    const mode = Number(args[0]);
    return new Promise((resolve, reject) => {
      compress(
        new Uint8Array(input),
        mode,
        (result, error: any) => {
          if (error) {
            reject(
              new OperationError(
                `Failed to compress input: ${error?.message || error}`,
              ),
            );
          }
          // The compression returns as an Int8Array, but we can just get the unsigned data from the buffer
          resolve(new Int8Array(result as number[]).buffer);
        },
        () => {
          // Progress updates disabled in VS Code extension context
        },
      );
    });
  }
}

export default LZMACompress;
