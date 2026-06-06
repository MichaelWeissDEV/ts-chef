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

import { Operation, ArgConfig } from "../Operation";
import { OperationError } from "../errors/OperationError";
import { Utils } from "../Utils";
import { toHex } from "../lib/Hex";

/**
 * Computes the ChaCha block function
 */
function chacha(
  key: number[],
  nonce: number[],
  counter: number[],
  rounds: number,
): number[] {
  const tau = "expand 16-byte k";
  const sigma = "expand 32-byte k";

  let state: number[], c: number[];
  if (key.length === 16) {
    c = Utils.strToByteArray(tau);
    state = c.concat(key).concat(key);
  } else {
    c = Utils.strToByteArray(sigma);
    state = c.concat(key);
  }
  state = state.concat(counter).concat(nonce);

  const x: number[] = [];
  for (let i = 0; i < 64; i += 4) {
    x.push(Utils.byteArrayToInt(state.slice(i, i + 4), "little"));
  }
  const a = [...x];

  function ROL32(x: number, n: number): number {
    return ((x << n) & 0xffffffff) | (x >>> (32 - n));
  }

  function quarterround(
    x: number[],
    a: number,
    b: number,
    c: number,
    d: number,
  ): void {
    x[a] = (x[a] + x[b]) & 0xffffffff;
    x[d] = ROL32(x[d] ^ x[a], 16);
    x[c] = (x[c] + x[d]) & 0xffffffff;
    x[b] = ROL32(x[b] ^ x[c], 12);
    x[a] = (x[a] + x[b]) & 0xffffffff;
    x[d] = ROL32(x[d] ^ x[a], 8);
    x[c] = (x[c] + x[d]) & 0xffffffff;
    x[b] = ROL32(x[b] ^ x[c], 7);
  }

  for (let i = 0; i < rounds / 2; i++) {
    quarterround(x, 0, 4, 8, 12);
    quarterround(x, 1, 5, 9, 13);
    quarterround(x, 2, 6, 10, 14);
    quarterround(x, 3, 7, 11, 15);
    quarterround(x, 0, 5, 10, 15);
    quarterround(x, 1, 6, 11, 12);
    quarterround(x, 2, 7, 8, 13);
    quarterround(x, 3, 4, 9, 14);
  }

  for (let i = 0; i < 16; i++) {
    x[i] = (x[i] + a[i]) & 0xffffffff;
  }

  let output: number[] = [];
  for (let i = 0; i < 16; i++) {
    output = output.concat(Utils.intToByteArray(x[i], 4, "little"));
  }
  return output;
}

/**
 * ChaCha operation
 *
 * @category Ciphers
 */
export class ChaCha extends Operation {
  name = "ChaCha";
  module = "Ciphers";
  description =
    "ChaCha is a stream cipher designed by Daniel J. Bernstein. It is a variant of the Salsa stream cipher. Several parameterizations exist; 'ChaCha' may refer to the original construction, or to the variant as described in RFC-8439. ChaCha is often used with Poly1305, in the ChaCha20-Poly1305 AEAD construction.<br><br><b>Key:</b> ChaCha uses a key of 16 or 32 bytes (128 or 256 bits).<br><br><b>Nonce:</b> ChaCha uses a nonce of 8 or 12 bytes (64 or 96 bits).<br><br><b>Counter:</b> ChaCha uses a counter of 4 or 8 bytes (32 or 64 bits); together, the nonce and counter must add up to 16 bytes. The counter starts at zero at the start of the keystream, and is incremented at every 64 bytes.";
  infoURL = "https://wikipedia.org/wiki/Salsa20#ChaCha_variant";
  inputType = "string";
  outputType = "string";
  args: ArgConfig[] = [
    {
      name: "Key",
      type: "toggleString",
      value: "",
      toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
    },
    {
      name: "Nonce",
      type: "toggleString",
      value: "",
      toggleValues: ["Hex", "UTF8", "Latin1", "Base64", "Integer"],
    },
    {
      name: "Counter",
      type: "number",
      value: 0,
      min: 0,
    },
    {
      name: "Rounds",
      type: "option",
      value: ["20", "12", "8"],
    },
    {
      name: "Input",
      type: "option",
      value: ["Hex", "Raw"],
    },
    {
      name: "Output",
      type: "option",
      value: ["Raw", "Hex"],
    },
  ];

  /**
   * Runs the ChaCha operation.
   *
   * @param {string} input - The input string to encrypt/decrypt.
   * @param {any[]} args - The arguments for the operation.
   * @param {Object} args[0] - The key.
   * @param {string} args[0].string - The key value.
   * @param {string} args[0].option - The key format (Hex, UTF8, Latin1, Base64).
   * @param {Object} args[1] - The nonce.
   * @param {string} args[1].string - The nonce value.
   * @param {string} args[1].option - The nonce format (Hex, UTF8, Latin1, Base64, Integer).
   * @param {number} args[2] - The counter value.
   * @param {string} args[3] - The number of rounds (20, 12, 8).
   * @param {string} args[4] - The input format (Hex, Raw).
   * @param {string} args[5] - The output format (Raw, Hex).
   * @returns {string} - The resulting string.
   */
  run(input: string, args: any[]): string {
    const key = Utils.convertToByteArray(args[0].string, args[0].option);
    const nonceType = args[1].option;
    const rounds = parseInt(args[3], 10);
    const inputType = args[4];
    const outputType = args[5];

    if (key.length !== 16 && key.length !== 32) {
      throw new OperationError(`Invalid key length: ${key.length} bytes.

ChaCha uses a key of 16 or 32 bytes (128 or 256 bits).`);
    }

    let counter: number[], nonce: number[], counterLength: number;
    if (nonceType === "Integer") {
      nonce = Utils.intToByteArray(parseInt(args[1].string, 10), 12, "little");
      counterLength = 4;
    } else {
      nonce = Utils.convertToByteArray(args[1].string, args[1].option);
      if (!(nonce.length === 12 || nonce.length === 8)) {
        throw new OperationError(`Invalid nonce length: ${nonce.length} bytes.

ChaCha uses a nonce of 8 or 12 bytes (64 or 96 bits).`);
      }
      counterLength = 16 - nonce.length;
    }
    counter = Utils.intToByteArray(args[2], counterLength, "little");

    const output: number[] = [];
    const inputBytes = Utils.convertToByteArray(input, inputType);

    let counterAsInt = Utils.byteArrayToInt(counter, "little");
    for (let i = 0; i < inputBytes.length; i += 64) {
      counter = Utils.intToByteArray(counterAsInt, counterLength, "little");
      const stream = chacha(key, nonce, counter, rounds);
      for (let j = 0; j < 64 && i + j < inputBytes.length; j++) {
        output.push(inputBytes[i + j] ^ stream[j]);
      }
      counterAsInt++;
    }

    if (outputType === "Hex") {
      return toHex(output);
    } else {
      return Utils.byteArrayToChars(output);
    }
  }
}

export default ChaCha;
