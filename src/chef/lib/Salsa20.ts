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

import { Utils } from "../Utils";

function ROL32(x: number, n: number): number {
  return ((x << n) & 0xffffffff) | (x >>> (32 - n));
}

function salsa20Permute(x: number[], rounds: number): void {
  function quarterround(
    arr: number[],
    a: number,
    b: number,
    c: number,
    d: number,
  ): void {
    arr[b] ^= ROL32((arr[a] + arr[d]) & 0xffffffff, 7);
    arr[c] ^= ROL32((arr[b] + arr[a]) & 0xffffffff, 9);
    arr[d] ^= ROL32((arr[c] + arr[b]) & 0xffffffff, 13);
    arr[a] ^= ROL32((arr[d] + arr[c]) & 0xffffffff, 18);
  }
  for (let i = 0; i < rounds / 2; i++) {
    quarterround(x, 0, 4, 8, 12);
    quarterround(x, 5, 9, 13, 1);
    quarterround(x, 10, 14, 2, 6);
    quarterround(x, 15, 3, 7, 11);
    quarterround(x, 0, 1, 2, 3);
    quarterround(x, 5, 6, 7, 4);
    quarterround(x, 10, 11, 8, 9);
    quarterround(x, 15, 12, 13, 14);
  }
}

export function salsa20Block(
  keyIn: number[],
  nonce: number[],
  counter: number[],
  rounds: number,
): number[] {
  const tau = "expand 16-byte k";
  const sigma = "expand 32-byte k";
  let key = [...keyIn];
  let c: number[];

  if (key.length === 16) {
    c = Utils.strToByteArray(tau);
    key = key.concat(key);
  } else {
    c = Utils.strToByteArray(sigma);
  }

  let state: number[] = [];
  state = state.concat(c.slice(0, 4), key.slice(0, 16), c.slice(4, 8));
  state = state.concat(nonce, counter);
  state = state.concat(c.slice(8, 12), key.slice(16, 32), c.slice(12, 16));

  const x: number[] = [];
  for (let i = 0; i < 64; i += 4) {
    x.push(Utils.byteArrayToInt(state.slice(i, i + 4), "little"));
  }
  const a = [...x];

  salsa20Permute(x, rounds);

  for (let i = 0; i < 16; i++) {
    x[i] = (x[i] + a[i]) & 0xffffffff;
  }

  let output: number[] = [];
  for (let i = 0; i < 16; i++) {
    output = output.concat(Utils.intToByteArray(x[i], 4, "little"));
  }
  return output;
}

export function hsalsa20(
  keyIn: number[],
  nonce: number[],
  rounds: number,
): number[] {
  const tau = "expand 16-byte k";
  const sigma = "expand 32-byte k";
  let key = [...keyIn];
  let c: number[];

  if (key.length === 16) {
    c = Utils.strToByteArray(tau);
    key = key.concat(key);
  } else {
    c = Utils.strToByteArray(sigma);
  }

  let state: number[] = [];
  state = state.concat(c.slice(0, 4), key.slice(0, 16), c.slice(4, 8));
  state = state.concat(nonce);
  state = state.concat(c.slice(8, 12), key.slice(16, 32), c.slice(12, 16));

  const x: number[] = [];
  for (let i = 0; i < 64; i += 4) {
    x.push(Utils.byteArrayToInt(state.slice(i, i + 4), "little"));
  }

  salsa20Permute(x, rounds);

  const output: number[] = [];
  const idx = [0, 5, 10, 15, 6, 7, 8, 9];
  for (const i of idx) {
    output.push(...Utils.intToByteArray(x[i], 4, "little"));
  }
  return output;
}
