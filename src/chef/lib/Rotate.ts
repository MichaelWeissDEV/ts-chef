/**
 * @fileoverview Rotate module for ts-chef extension
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

/**
 * Apply a single-byte rotation algorithm to each byte in the data array a given number of times.
 *
 * @param data - Array of bytes to rotate
 * @param amount - Number of times to apply the algorithm per byte
 * @param algo - Single-byte rotation function to apply
 * @returns New array with each byte rotated
 */
export function rot(
  data: number[],
  amount: number,
  algo: (b: number) => number,
): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    let b = data[i];
    for (let j = 0; j < amount; j++) {
      b = algo(b);
    }
    result.push(b);
  }
  return result;
}

/**
 * Rotate a single byte one position to the right, wrapping the LSB to the MSB.
 *
 * @param b - Byte to rotate
 * @returns Rotated byte
 */
export function rotr(b: number): number {
  const bit = (b & 1) << 7;
  return (b >> 1) | bit;
}

/**
 * Rotate a single byte one position to the left, wrapping the MSB to the LSB.
 *
 * @param b - Byte to rotate
 * @returns Rotated byte
 */
export function rotl(b: number): number {
  const bit = (b >> 7) & 1;
  return ((b << 1) | bit) & 0xff;
}

/**
 * Rotate an array of bytes to the right by a given number of bits, carrying bits across byte boundaries.
 *
 * @param data - Array of bytes to rotate
 * @param amount - Number of bit positions to rotate right
 * @returns New array with bytes rotated right with carry
 */
export function rotrCarry(data: number[], amount: number): number[] {
  const result: number[] = [];
  let carryBits = 0,
    newByte: number;

  amount = amount % 8;
  for (let i = 0; i < data.length; i++) {
    const oldByte = data[i] >>> 0;
    newByte = (oldByte >> amount) | carryBits;
    carryBits = (oldByte & (Math.pow(2, amount) - 1)) << (8 - amount);
    result.push(newByte);
  }
  result[0] |= carryBits;
  return result;
}

/**
 * Rotate an array of bytes to the left by a given number of bits, carrying bits across byte boundaries.
 *
 * @param data - Array of bytes to rotate
 * @param amount - Number of bit positions to rotate left
 * @returns New array with bytes rotated left with carry
 */
export function rotlCarry(data: number[], amount: number): number[] {
  const result: number[] = new Array(data.length);
  let carryBits = 0,
    newByte: number;

  amount = amount % 8;
  for (let i = data.length - 1; i >= 0; i--) {
    const oldByte = data[i];
    newByte = ((oldByte << amount) | carryBits) & 0xff;
    carryBits = (oldByte >> (8 - amount)) & (Math.pow(2, amount) - 1);
    result[i] = newByte;
  }
  result[data.length - 1] = result[data.length - 1] | carryBits;
  return result;
}
