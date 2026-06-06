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
import { decompress } from "@blu3r4y/lzma";
import Utils from "../Utils";

/**
 * LZMA Decompress operation
 */
export class LZMADecompress extends Operation {
  /**
   * LZMADecompress constructor
   */
  constructor() {
    super();

    this.name = "LZMA Decompress";
    this.module = "Compression";
    this.description =
      "Decompresses data using the Lempel-Ziv-Markov chain Algorithm.";
    this.infoURL =
      "https://wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Markov_chain_algorithm";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {ArrayBuffer}
   */
  async run(input: any, args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      decompress(
        new Uint8Array(input),
        (result, error: any) => {
          if (error) {
            reject(
              new OperationError(
                `Failed to decompress input: ${error?.message || error}`,
              ),
            );
          }
          // The decompression returns either a String or an untyped unsigned int8 array, but we can just get the unsigned data from the buffer

          if (typeof result == "string") {
            resolve(Utils.strToArrayBuffer(result));
          } else {
            resolve(new Int8Array(result as unknown as number[]).buffer);
          }
        },
        () => {
          // Progress updates disabled in VS Code extension context
        },
      );
    });
  }
}

export default LZMADecompress;
