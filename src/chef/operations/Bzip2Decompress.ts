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
const Bzip2 = require("libbzip2-wasm");

/**
 * Decompress data using the Bzip2 algorithm.
 *
 * @category Compression
 * @see https://wikipedia.org/wiki/Bzip2
 */
export class Bzip2Decompress extends Operation {
  /**
   * Bzip2Decompress constructor
   */
  constructor() {
    super();

    this.name = "Bzip2 Decompress";
    this.module = "Compression";
    this.description = "Decompress data using the Bzip2 algorithm.";
    this.infoURL = "https://wikipedia.org/wiki/Bzip2";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [
      {
        name: "Use low-memory, slower decompression algorithm",
        type: "boolean",
        value: false,
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {any[]} args
   * @returns {Promise<ArrayBuffer>}
   */
  async run(input: ArrayBuffer, args: any[]): Promise<ArrayBuffer> {
    const [small] = args;
    if (input.byteLength <= 0) {
      throw new OperationError("Please provide an input.");
    }

    const bzip2 = await new Promise<any>((resolve) => {
      const m = Bzip2();
      if (m.then) {
        m.then((instance: any) => {
          resolve({ decompressBZ2: instance.decompressBZ2.bind(instance) });
        });
      } else {
        resolve({ decompressBZ2: m.decompressBZ2.bind(m) });
      }
    });

    const inpArray = new Uint8Array(input);
    const bzip2cc = bzip2.decompressBZ2(inpArray, small ? 1 : 0);

    if (bzip2cc.error !== 0) {
      throw new OperationError(bzip2cc.error_msg);
    } else {
      const output = bzip2cc.output;
      return output.buffer.slice(
        output.byteOffset,
        output.byteLength + output.byteOffset,
      ) as ArrayBuffer;
    }
  }
}

export default Bzip2Decompress;
