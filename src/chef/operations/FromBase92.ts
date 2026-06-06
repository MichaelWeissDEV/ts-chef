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

function genBase92Alphabet(): string {
  let s = "";
  for (let i = 33; i <= 126; i++) {
    if (i !== 34 && i !== 96) s += String.fromCharCode(i);
  }
  return s;
}

const BASE92_ALPHABET = genBase92Alphabet();

export class FromBase92 extends Operation {
  constructor() {
    super();
    this.name = "From Base92";
    this.module = "Default";
    this.description = "Base92 decodes data from a Base92-encoded string.";
    this.infoURL = "https://base92.github.io/";
    this.inputType = "string";
    this.outputType = "byteArray";
    this.args = [];
  }

  run(input: string, _args: unknown[]): number[] {
    const alphabet = BASE92_ALPHABET;

    // Strip characters not in the alphabet (whitespace, delimiters, etc.)
    const clean = Array.from(input)
      .filter((c) => alphabet.includes(c))
      .join("");

    const bytes: number[] = [];
    let bitAccum = 0;
    let bits = 0;

    const pairCount = Math.floor(clean.length / 2);
    const hasSingle = clean.length % 2 === 1;

    for (let i = 0; i < pairCount * 2; i += 2) {
      const c1 = alphabet.indexOf(clean[i]);
      const c2 = alphabet.indexOf(clean[i + 1]);
      // Inverse of: c1_idx = n % 91, c2_idx = floor(n/91) + 1
      const val = c1 + (c2 - 1) * 91;
      bitAccum = (bitAccum << 13) | val;
      bits += 13;
      while (bits >= 8) {
        bits -= 8;
        bytes.push((bitAccum >> bits) & 0xff);
      }
      bitAccum &= (1 << bits) - 1;
    }

    if (hasSingle) {
      // Single trailing char encodes up to 6 bits (left-aligned, zero-padded at bottom)
      // Inverse of: c_idx = (remaining << (6 - realBits)) + 1
      const c = alphabet.indexOf(clean[clean.length - 1]);
      const val = c - 1; // 6-bit value: real data in top bits, padding zeros at bottom
      bitAccum = (bitAccum << 6) | val;
      bits += 6;
      while (bits >= 8) {
        bits -= 8;
        bytes.push((bitAccum >> bits) & 0xff);
      }
      // Remaining bits < 8 are zero-padding from the encoder — discard.
    }

    return bytes;
  }
}

export default FromBase92;
