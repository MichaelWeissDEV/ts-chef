/**
 * @fileoverview CipherSaber2 module for ts-chef extension
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

export function encode(
  tempIVP: number[] | Uint8Array,
  key: number[],
  rounds: number,
  input: number[] | Uint8Array,
): number[] {
  const ivp = new Uint8Array([...key, ...tempIVP]);
  const state = new Array(256).fill(0);
  let j = 0;
  let i: number;
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
    i = (i + 1) % 256;
    j = (j + state[i]) % 256;
    [state[i], state[j]] = [state[j], state[i]];
    const n = (state[i] + state[j]) % 256;
    result.push(state[n] ^ input[x]);
  }
  return result;
}
