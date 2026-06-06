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

function sha0(data: Uint8Array): string {
  const H = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];

  const msgLen = data.length;
  const bitLen = msgLen * 8;

  const padded = new Uint8Array(Math.ceil((msgLen + 9) / 64) * 64);
  padded.set(data);
  padded[msgLen] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, bitLen & 0xffffffff, false);
  view.setUint32(padded.length - 8, Math.floor(bitLen / 2 ** 32), false);

  function ROL32(x: number, n: number): number {
    return ((x << n) >>> 0) | (x >>> (32 - n));
  }

  for (let i = 0; i < padded.length; i += 64) {
    const W = new Array<number>(80);
    for (let t = 0; t < 16; t++) {
      W[t] = view.getUint32(i + t * 4, false);
    }
    // SHA0: no bit rotation in message schedule (unlike SHA1 which has ROL32 by 1)
    for (let t = 16; t < 80; t++) {
      W[t] = (W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16]) >>> 0;
    }

    let [a, b, c, d, e] = H;

    for (let t = 0; t < 80; t++) {
      let f: number, k: number;
      if (t < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (t < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (t < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }
      const temp = (ROL32(a, 5) + f + e + k + W[t]) >>> 0;
      e = d;
      d = c;
      c = ROL32(b, 30);
      b = a;
      a = temp;
    }

    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
  }

  return H.map((h) => h.toString(16).padStart(8, "0")).join("");
}

export class SHA0 extends Operation {
  constructor() {
    super();
    this.name = "SHA0";
    this.module = "Crypto";
    this.description =
      "SHA-0 is the original version of the 160-bit hash function published in 1993 under the name 'SHA'. It was withdrawn shortly after publication due to an undisclosed significant flaw.";
    this.infoURL = "https://wikipedia.org/wiki/SHA-1#SHA-0";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [{ name: "Rounds", type: "number", value: 80, min: 16 }];
  }

  run(input: ArrayBuffer, _args: unknown[]): string {
    return sha0(new Uint8Array(input));
  }
}

export default SHA0;
