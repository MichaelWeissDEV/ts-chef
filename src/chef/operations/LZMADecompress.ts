/**
 * @fileoverview LZMADecompress operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation,  AnyInput  } from "../Operation_new";
import OperationError from "../errors/OperationError";
import { decompress } from "@blu3r4y/lzma";
import Utils from "../Utils";

/**
 * LZMA Decompress operation
 */
export class LZMADecompress extends TypedOperation<ArrayBuffer, Promise<AnyInput>, unknown[]> {
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
  async run(input: ArrayBuffer, _args: unknown[]): Promise<AnyInput> {
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
