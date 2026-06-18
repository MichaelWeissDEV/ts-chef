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

import { Operation, AnyInput } from "../Operation";
import { INFLATE_BUFFER_TYPE } from "../lib/Zlib";
import rawinflate from "zlibjs/bin/rawinflate.min.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Zlib = (rawinflate as any).Zlib;

const RAW_BUFFER_TYPE_LOOKUP = {
  Adaptive: Zlib.RawInflate.BufferType.ADAPTIVE,
  Block: Zlib.RawInflate.BufferType.BLOCK,
};

/**
 * Raw Inflate operation
 */
export class RawInflate extends Operation {
  /**
   * RawInflate constructor
   */
  constructor() {
    super();

    this.name = "Raw Inflate";
    this.module = "Compression";
    this.description =
      "Decompresses data which has been compressed using the deflate algorithm with no headers.";
    this.infoURL = "https://wikipedia.org/wiki/DEFLATE";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [
      {
        name: "Start index",
        type: "number",
        value: 0,
      },
      {
        name: "Initial output buffer size",
        type: "number",
        value: 0,
      },
      {
        name: "Buffer expansion type",
        type: "option",
        value: INFLATE_BUFFER_TYPE,
      },
      {
        name: "Resize buffer after decompression",
        type: "boolean",
        value: false,
      },
      {
        name: "Verify result",
        type: "boolean",
        value: false,
      },
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).checks = [
      {
        entropyRange: [7.5, 8],
        args: [0, 0, INFLATE_BUFFER_TYPE, false, false],
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {ArrayBuffer}
   */
  run(input: ArrayBuffer, args: unknown[]): ArrayBuffer {
    const [startIndex, bufferSize, bufferTypeKey, resize, verify] = args as [
      number,
      number,
      keyof typeof RAW_BUFFER_TYPE_LOOKUP,
      boolean,
      boolean,
    ];
    const inflate = new Zlib.RawInflate(new Uint8Array(input), {
        index: startIndex,
        bufferSize,
        bufferType: RAW_BUFFER_TYPE_LOOKUP[bufferTypeKey],
        resize,
        verify,
      }),
      result = new Uint8Array(inflate.decompress());

    return result.buffer;
  }
}

export default RawInflate;
