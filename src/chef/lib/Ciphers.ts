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
export const format: Record<string, CryptoJS.lib.WordArray | any> = {
  Latin1: CryptoJS.enc.Latin1,
  UTF8: CryptoJS.enc.Utf8,
  UTF16: CryptoJS.enc.Utf16,
  UTF16LE: CryptoJS.enc.Utf16LE,
  UTF16BE: CryptoJS.enc.Utf16BE,
  Hex: CryptoJS.enc.Hex,
  Base64: CryptoJS.enc.Base64,
};

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

export function genPolybiusSquare(keyword: string): string[][] {
  const alpha = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
  const polArray = [...new Set(`${keyword}${alpha}`.split(""))];
  const polybius: string[][] = [];

  for (let i = 0; i < 5; i++) {
    polybius[i] = polArray.slice(i * 5, i * 5 + 5);
  }
  return polybius;
}
