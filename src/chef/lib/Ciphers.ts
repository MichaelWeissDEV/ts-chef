/**
 * @fileoverview Ciphers module for ts-chef extension
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Utils } from "../Utils";
import { OperationError } from "../errors/OperationError";
import CryptoJS from "crypto-js";

/**
 * CryptoJS format encoders mapped by name, mirroring CyberChef's Ciphers.mjs format object.
 */
export const format: Record<string, typeof CryptoJS.enc.Hex> = {
  Latin1: CryptoJS.enc.Latin1,
  UTF8: CryptoJS.enc.Utf8,
  UTF16: CryptoJS.enc.Utf16,
  UTF16LE: CryptoJS.enc.Utf16LE,
  UTF16BE: CryptoJS.enc.Utf16BE,
  Hex: CryptoJS.enc.Hex,
  Base64: CryptoJS.enc.Base64,
};

/**
 * Encodes a string using the Affine cipher with the given coefficients a and b.
 *
 * @param input - The plaintext string to encode.
 * @param args - A two-element array where args[0] is coefficient `a` and args[1] is coefficient `b`.
 * @returns The encoded ciphertext string.
 * @throws {OperationError} If a or b are not integers, or if a is not coprime to 26.
 */
export function affineEncode(input: string, args: number[]): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const a = args[0];
  const b = args[1];
  let output = "";

  if (
    !/^\+?(0|[1-9]\d*)$/.test(String(a)) ||
    !/^\+?(0|[1-9]\d*)$/.test(String(b))
  ) {
    throw new OperationError("The values of a and b can only be integers.");
  }

  if (Utils.gcd(a, 26) !== 1) {
    throw new OperationError("The value of `a` must be coprime to 26.");
  }

  for (let i = 0; i < input.length; i++) {
    if (alphabet.indexOf(input[i]) >= 0) {
      output += alphabet[(a * alphabet.indexOf(input[i]) + b) % 26];
    } else if (alphabet.indexOf(input[i].toLowerCase()) >= 0) {
      output +=
        alphabet[
          (a * alphabet.indexOf(input[i].toLowerCase()) + b) % 26
        ].toUpperCase();
    } else {
      output += input[i];
    }
  }
  return output;
}

/**
 * Generates a 5x5 Polybius square seeded with the given keyword.
 *
 * @param keyword - The keyword used to fill the square before the remaining alphabet letters (J is omitted).
 * @returns A 5x5 array of uppercase letter strings representing the Polybius square.
 */
export function genPolybiusSquare(keyword: string): string[][] {
  const alpha = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
  const polArray = [...new Set(`${keyword}${alpha}`.split(""))];
  const polybius: string[][] = [];

  for (let i = 0; i < 5; i++) {
    polybius[i] = polArray.slice(i * 5, i * 5 + 5);
  }
  return polybius;
}
