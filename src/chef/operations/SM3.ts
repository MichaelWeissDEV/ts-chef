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

function ROL32(x: number, n: number): number {
  return ((x << n) >>> 0) | (x >>> (32 - n));
}

function sm3(data: Uint8Array): string {
  const msgLen = data.length;
  const bitLen = msgLen * 8;

  const padded = new Uint8Array(Math.ceil((msgLen + 9) / 64) * 64);
  padded.set(data);
  padded[msgLen] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 4, bitLen >>> 0, false);
  dv.setUint32(padded.length - 8, Math.floor(bitLen / 2 ** 32), false);

  const T: number[] = [];
  for (let j = 0; j < 16; j++) T[j] = 0x79cc4519;
  for (let j = 16; j < 64; j++) T[j] = 0x7a879d8a;

  function P0(x: number): number {
    return x ^ ROL32(x, 9) ^ ROL32(x, 17);
  }
  function P1(x: number): number {
    return x ^ ROL32(x, 15) ^ ROL32(x, 23);
  }
  function FF(x: number, y: number, z: number, j: number): number {
    return j < 16 ? x ^ y ^ z : (x & y) | (x & z) | (y & z);
  }
  function GG(x: number, y: number, z: number, j: number): number {
    return j < 16 ? x ^ y ^ z : (x & y) | (~x & z);
  }

  let V = [
    0x7380166f, 0x4914b2b9, 0x172442d7, 0xda8a0600, 0xa96f30bc, 0x163138aa,
    0xe38dee4d, 0xb0fb0e4e,
  ];

  for (let i = 0; i < padded.length; i += 64) {
    const W: number[] = [];
    for (let j = 0; j < 16; j++) {
      W[j] = dv.getUint32(i + j * 4, false);
    }
    for (let j = 16; j < 68; j++) {
      W[j] =
        (P1(W[j - 16] ^ W[j - 9] ^ ROL32(W[j - 3], 15)) ^
          ROL32(W[j - 13], 7) ^
          W[j - 6]) >>>
        0;
    }
    const W1: number[] = [];
    for (let j = 0; j < 64; j++) W1[j] = (W[j] ^ W[j + 4]) >>> 0;

    let [A, B, C, D, E, F, G, H] = V;

    for (let j = 0; j < 64; j++) {
      const SS1 = ROL32((ROL32(A, 12) + E + ROL32(T[j], j % 32)) >>> 0, 7);
      const SS2 = (SS1 ^ ROL32(A, 12)) >>> 0;
      const TT1 = (FF(A, B, C, j) + D + SS2 + W1[j]) >>> 0;
      const TT2 = (GG(E, F, G, j) + H + SS1 + W[j]) >>> 0;
      D = C;
      C = ROL32(B, 9);
      B = A;
      A = TT1;
      H = G;
      G = ROL32(F, 19);
      F = E;
      E = P0(TT2);
    }

    V = [
      (V[0] ^ A) >>> 0,
      (V[1] ^ B) >>> 0,
      (V[2] ^ C) >>> 0,
      (V[3] ^ D) >>> 0,
      (V[4] ^ E) >>> 0,
      (V[5] ^ F) >>> 0,
      (V[6] ^ G) >>> 0,
      (V[7] ^ H) >>> 0,
    ];
  }

  return V.map((h) => h.toString(16).padStart(8, "0")).join("");
}

export class SM3 extends Operation {
  constructor() {
    super();
    this.name = "SM3";
    this.module = "Crypto";
    this.description =
      "SM3 is a cryptographic hash function used in the Chinese National Standard, producing a 256-bit digest.";
    this.infoURL = "https://wikipedia.org/wiki/SM3_(hash_function)";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      { name: "Length", type: "number", value: 256 },
      { name: "Rounds", type: "number", value: 64, min: 16 },
    ];
  }

  run(input: ArrayBuffer, _args: unknown[]): string {
    return sm3(new Uint8Array(input));
  }
}

export default SM3;
