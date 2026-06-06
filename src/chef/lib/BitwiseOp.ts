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

/**
 * Supported delimiters for bitwise operations.
 */
export const BITWISE_OP_DELIMS = [
  "Hex",
  "Decimal",
  "Binary",
  "Base64",
  "UTF8",
  "Latin1",
];

/**
 * Performs a bitwise operation on an input array using a key array.
 *
 * Supports different schemes like 'Standard', 'Input differential', and 'Output differential'.
 *
 * @param input - The input byte array.
 * @param key - The key byte array.
 * @param func - The bitwise function to apply (e.g., xor, and, or).
 * @param nullPreserving - If true, 0x00 bytes in the input or bytes matching the key are preserved.
 * @param scheme - The operation scheme (default: 'Standard').
 * @returns The resulting byte array.
 */
export function bitOp(
  input: number[],
  key: number[] | null,
  func: (operand: number, key: number) => number,
  nullPreserving: boolean = false,
  scheme: string = "Standard",
): number[] {
  if (!key || !key.length) key = [0];
  const result: number[] = [];
  const keyCopy = [...key];

  for (let i = 0; i < input.length; i++) {
    const k =
      scheme === "Cascade" ? input[i + 1] || 0 : keyCopy[i % keyCopy.length];
    const o = input[i];
    const x = nullPreserving && (o === 0 || o === k) ? o : func(o, k);
    result.push(x);
    if (
      scheme &&
      scheme !== "Standard" &&
      !(nullPreserving && (o === 0 || o === k))
    ) {
      switch (scheme) {
        case "Input differential":
          keyCopy[i % keyCopy.length] = o;
          break;
        case "Output differential":
          keyCopy[i % keyCopy.length] = x;
          break;
      }
    }
  }

  return result;
}

/**
 * XOR bitwise operation.
 *
 * @param operand - Input byte.
 * @param key - Key byte.
 * @returns XORed result.
 */
export function xor(operand: number, key: number): number {
  return operand ^ key;
}

/**
 * NOT bitwise operation (8-bit).
 *
 * @param operand - Input byte.
 * @param _key - Ignored.
 * @returns Bitwise NOT result.
 */
export function not(operand: number, _key: number): number {
  return ~operand & 0xff;
}

/**
 * AND bitwise operation.
 *
 * @param operand - Input byte.
 * @param key - Key byte.
 * @returns Bitwise AND result.
 */
export function and(operand: number, key: number): number {
  return operand & key;
}

/**
 * OR bitwise operation.
 *
 * @param operand - Input byte.
 * @param key - Key byte.
 * @returns Bitwise OR result.
 */
export function or(operand: number, key: number): number {
  return operand | key;
}

/**
 * Addition operation (modulo 256).
 *
 * @param operand - Input byte.
 * @param key - Key byte.
 * @returns Sum result.
 */
export function add(operand: number, key: number): number {
  return (operand + key) % 256;
}

/**
 * Subtraction operation (modulo 256).
 *
 * @param operand - Input byte.
 * @param key - Key byte.
 * @returns Difference result.
 */
export function sub(operand: number, key: number): number {
  const result = operand - key;
  return result < 0 ? 256 + result : result;
}
