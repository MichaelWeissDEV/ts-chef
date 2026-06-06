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

// 92 printable ASCII characters, skipping '"' (34) and '`' (96)
function genBase92Alphabet(): string {
  let s = "";
  for (let i = 33; i <= 126; i++) {
    if (i !== 34 && i !== 96) s += String.fromCharCode(i);
  }
  return s;
}

const BASE92_ALPHABET = genBase92Alphabet(); // length = 92

export class ToBase92 extends Operation {
  constructor() {
    super();
    this.name = "To Base92";
    this.module = "Default";
    this.description =
      "Base92 encodes data using 92 printable ASCII characters.";
    this.infoURL = "https://base92.github.io/";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [];
  }

  run(input: ArrayBuffer, _args: unknown[]): string {
    const bytes = new Uint8Array(input);
    const alph = BASE92_ALPHABET;
    let result = "";
    let bitAccum = 0;
    let bits = 0;

    const encodePair = (n: number): void => {
      // base-91 pair: ensures both char indices stay within [0..90] and [1..91]
      result += alph[n % 91] + alph[Math.floor(n / 91) + 1];
    };

    for (const byte of bytes) {
      bitAccum = (bitAccum << 8) | byte;
      bits += 8;
      while (bits >= 13) {
        bits -= 13;
        encodePair((bitAccum >> bits) & 0x1fff);
      }
    }

    if (bits > 0) {
      // Shift remaining bits to the top of a 13-bit slot (zero-pad at the bottom)
      const val = (bitAccum << (13 - bits)) & 0x1fff;
      if (bits <= 6) {
        // Single char: encode remaining as a 6-bit left-aligned value (offset+1 to avoid '!')
        const remaining = bitAccum & ((1 << bits) - 1);
        result += alph[(remaining << (6 - bits)) + 1];
      } else {
        // Two chars: encode the full 13-bit padded value as a base-91 pair
        encodePair(val);
      }
    }

    return result;
  }
}

export default ToBase92;
