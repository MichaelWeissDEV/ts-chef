/**
 * @fileoverview LZMACompress operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation,  AnyInput  } from "../Operation_new";
import OperationError from "../errors/OperationError";

import { compress } from "@blu3r4y/lzma";

/**
 * LZMA Compress operation
 */
export class LZMACompress extends TypedOperation<ArrayBuffer, Promise<AnyInput>, unknown[]> {
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
  async run(input: ArrayBuffer, args: unknown[]): Promise<AnyInput> {
    const [modeArg] = args as [string];
    const mode = Number(modeArg);
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
