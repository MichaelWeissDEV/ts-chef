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
import { OperationError } from "../errors/OperationError";
import { SNEFRU_SBOX, SNEFRU_SHIFT_TABLE } from "../lib/SnefruSbox";

function ror32(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n)) | 0;
}

function snefruHash(
  data: Uint8Array,
  length: number,
  rounds: number,
): Uint8Array {
  const hashLen = length / 32;
  const blockSize = 16 - hashLen;
  const blockBytes = blockSize * 4;
  const state: number[] = new Array(hashLen).fill(0);

  function processBlock(block: Uint8Array, off: number): void {
    const W: number[] = new Array(16);
    for (let i = 0; i < hashLen; i++) W[i] = state[i] | 0;
    for (let i = 0; i < blockSize; i++) {
      const b = off + i * 4;
      W[hashLen + i] =
        (block[b] << 24) |
        (block[b + 1] << 16) |
        (block[b + 2] << 8) |
        block[b + 3] |
        0;
    }
    for (let i = 0; i < rounds << 1; i += 2) {
      for (let bw = 0; bw < 4; bw++) {
        for (let n = 0; n < 16; n++) {
          const sbe = SNEFRU_SBOX[i + ((n >> 1) & 1)][W[n] & 0xff] | 0;
          W[((n - 1) >>> 0) & 0xf] = (W[((n - 1) >>> 0) & 0xf] ^ sbe) | 0;
          W[(n + 1) & 0xf] = (W[(n + 1) & 0xf] ^ sbe) | 0;
        }
        for (let n = 0; n < 16; n++) W[n] = ror32(W[n], SNEFRU_SHIFT_TABLE[bw]);
      }
    }
    for (let i = 0; i < hashLen; i++) state[i] = (state[i] ^ W[15 - i]) | 0;
  }

  const totalLen = data.length;
  const numFull = Math.floor(totalLen / blockBytes);
  const rem = totalLen % blockBytes;

  for (let b = 0; b < numFull; b++) processBlock(data, b * blockBytes);

  if (rem > 0) {
    const partial = new Uint8Array(blockBytes);
    partial.set(data.subarray(numFull * blockBytes));
    processBlock(partial, 0);
  }

  const finalBlock = new Uint8Array(blockBytes);
  finalBlock[blockBytes - 5] = (totalLen >>> 29) & 0xff;
  finalBlock[blockBytes - 4] = (totalLen >>> 21) & 0xff;
  finalBlock[blockBytes - 3] = (totalLen >>> 13) & 0xff;
  finalBlock[blockBytes - 2] = (totalLen >>> 5) & 0xff;
  finalBlock[blockBytes - 1] = (totalLen << 3) & 0xff;
  processBlock(finalBlock, 0);

  const result = new Uint8Array(length / 8);
  for (let i = 0; i < hashLen; i++) {
    result[i * 4] = (state[i] >>> 24) & 0xff;
    result[i * 4 + 1] = (state[i] >>> 16) & 0xff;
    result[i * 4 + 2] = (state[i] >>> 8) & 0xff;
    result[i * 4 + 3] = state[i] & 0xff;
  }
  return result;
}

export class Snefru extends Operation {
  constructor() {
    super();
    this.name = "Snefru";
    this.module = "Hashing";
    this.description =
      "Snefru is a cryptographic hash function invented by Ralph Merkle in 1990 while working at Xerox PARC.";
    this.infoURL = "https://wikipedia.org/wiki/Snefru";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      { name: "Digest length", type: "option", value: ["128", "256"] },
      { name: "Rounds", type: "option", value: ["8", "4", "2"] },
    ];
  }

  run(input: ArrayBuffer, args: unknown[]): string {
    const length = parseInt(args[0] as string, 10);
    const rounds = parseInt(args[1] as string, 10);
    if (![128, 256].includes(length)) {
      throw new OperationError(`Unsupported digest length: ${length}`);
    }
    if (rounds < 2 || rounds > 8) {
      throw new OperationError("Rounds must be between 2 and 8");
    }
    const hash = snefruHash(new Uint8Array(input), length, rounds);
    return Array.from(hash)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}

export default Snefru;
