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
 * Bzip2 is a compression library developed by Julian Seward (of GHC fame) that uses the Burrows-Wheeler algorithm.
 *
 * @category Compression
 * @see https://wikipedia.org/wiki/Bzip2
 */
export class Bzip2Compress extends Operation {
  /**
   * Bzip2Compress constructor
   */
  constructor() {
    super();

    this.name = "Bzip2 Compress";
    this.module = "Compression";
    this.description =
      "Bzip2 is a compression library developed by Julian Seward (of GHC fame) that uses the Burrows-Wheeler algorithm. It only supports compressing single files and its compression is slow, however is more effective than Deflate (.gz & .zip).";
    this.infoURL = "https://wikipedia.org/wiki/Bzip2";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [
      {
        name: "Block size (100s of kb)",
        type: "number",
        value: 9,
        min: 1,
        max: 9,
      },
      {
        name: "Work factor",
        type: "number",
        value: 30,
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {any[]} args
   * @returns {Promise<ArrayBuffer>}
   */
  async run(input: ArrayBuffer, args: any[]): Promise<ArrayBuffer> {
    const [blockSize, workFactor] = args;
    if (input.byteLength <= 0) {
      throw new OperationError("Please provide an input.");
    }

    const bzip2 = await new Promise<any>((resolve) => {
      const m = Bzip2();
      if (m.then) {
        m.then((instance: any) => {
          resolve({ compressBZ2: instance.compressBZ2.bind(instance) });
        });
      } else {
        resolve({ compressBZ2: m.compressBZ2.bind(m) });
      }
    });

    const inpArray = new Uint8Array(input);
    const bzip2cc = bzip2.compressBZ2(inpArray, blockSize, workFactor);

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

export default Bzip2Compress;
