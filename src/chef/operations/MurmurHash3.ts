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

import { Operation } from "../Operation";

export class MurmurHash3 extends Operation {
  constructor() {
    super();
    this.name = "MurmurHash3";
    this.module = "Hashing";
    this.description =
      "Generates a MurmurHash v3 for a string input and an optional seed input";
    this.infoURL = "https://wikipedia.org/wiki/MurmurHash";
    this.inputType = "string";
    this.outputType = "number";
    this.args = [
      { name: "Seed", type: "number", value: 0 },
      { name: "Convert to Signed", type: "boolean", value: false },
    ];
  }

  mmh3(input: string, seed: number): number {
    let h1b: number;
    let k1: number;
    const remainder = input.length & 3;
    const bytes = input.length - remainder;
    let h1 = seed;
    const c1 = 0xcc9e2d51;
    const c2 = 0x1b873593;
    let i = 0;

    while (i < bytes) {
      k1 =
        (input.charCodeAt(i) & 0xff) |
        ((input.charCodeAt(++i) & 0xff) << 8) |
        ((input.charCodeAt(++i) & 0xff) << 16) |
        ((input.charCodeAt(++i) & 0xff) << 24);
      ++i;

      k1 =
        ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) &
        0xffffffff;
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 =
        ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) &
        0xffffffff;

      h1 ^= k1;
      h1 = (h1 << 13) | (h1 >>> 19);
      h1b =
        ((h1 & 0xffff) * 5 + ((((h1 >>> 16) * 5) & 0xffff) << 16)) & 0xffffffff;
      h1 = (h1b & 0xffff) + 0x6b64 + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16);
    }

    k1 = 0;

    if (remainder === 3) k1 ^= (input.charCodeAt(i + 2) & 0xff) << 16;
    if (remainder === 3 || remainder === 2)
      k1 ^= (input.charCodeAt(i + 1) & 0xff) << 8;
    if (remainder >= 1) {
      k1 ^= input.charCodeAt(i) & 0xff;
      k1 =
        ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) &
        0xffffffff;
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 =
        ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) &
        0xffffffff;
      h1 ^= k1;
    }

    h1 ^= input.length;
    h1 ^= h1 >>> 16;
    h1 =
      ((h1 & 0xffff) * 0x85ebca6b +
        ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) &
      0xffffffff;
    h1 ^= h1 >>> 13;
    h1 =
      ((h1 & 0xffff) * 0xc2b2ae35 +
        ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) &
      0xffffffff;
    h1 ^= h1 >>> 16;

    return h1 >>> 0;
  }

  unsignedToSigned(value: number): number {
    return value & 0x80000000 ? -0x100000000 + value : value;
  }

  run(input: string, args: unknown[]): number {
    const seed = (args[0] as number) ?? 0;
    const signed = args[1] as boolean;
    const hash = this.mmh3(input, seed);
    return signed ? this.unsignedToSigned(hash) : hash;
  }
}

export default MurmurHash3;
