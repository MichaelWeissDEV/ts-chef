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

export function encode(
  tempIVP: number[] | Uint8Array,
  key: number[],
  rounds: number,
  input: number[] | Uint8Array,
): number[] {
  const ivp = new Uint8Array([...key, ...tempIVP]);
  const state = new Array(256).fill(0);
  let j = 0,
    i = 0;
  const result: number[] = [];

  // Mixing states based off of IV.
  for (let i = 0; i < 256; i++) state[i] = i;
  const ivpLength = ivp.length;
  for (let r = 0; r < rounds; r++) {
    for (let k = 0; k < 256; k++) {
      j = (j + state[k] + ivp[k % ivpLength]) % 256;
      [state[k], state[j]] = [state[j], state[k]];
    }
  }
  j = 0;
  i = 0;

  // XOR cipher with key.
  for (let x = 0; x < input.length; x++) {
    i = ++i % 256;
    j = (j + state[i]) % 256;
    [state[i], state[j]] = [state[j], state[i]];
    const n = (state[i] + state[j]) % 256;
    result.push(state[n] ^ input[x]);
  }
  return result;
}
