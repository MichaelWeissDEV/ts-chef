/**
 * @fileoverview Decimal module for ts-chef extension
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Utils } from "../Utils";

/**
 * Parses a delimited decimal string into an array of byte values.
 *
 * @param data - The input string of space- or delimiter-separated decimal numbers.
 * @param delim - The delimiter between values; defaults to `"Auto"` (space).
 * @returns An array of numeric byte values parsed from the input.
 */
export function fromDecimal(data: string, delim: string = "Auto"): number[] {
  const delimStr = delim === "Auto" ? " " : Utils.charRep(delim);
  const output: number[] = [];
  let byteStr = data.split(delimStr);
  if (byteStr[byteStr.length - 1] === "")
    byteStr = byteStr.slice(0, byteStr.length - 1);

  for (let i = 0; i < byteStr.length; i++) {
    output[i] = parseInt(byteStr[i], 10);
  }
  return output;
}

/**
 * Converts a byte array to a delimited decimal string.
 *
 * @param data - The byte array or Uint8Array to convert.
 * @param delim - The delimiter to place between values; defaults to `"Space"`.
 * @returns A string of decimal byte values joined by the specified delimiter.
 */
export function toDecimal(
  data: number[] | Uint8Array,
  delim: string = "Space",
): string {
  const delimStr = Utils.charRep(delim);
  const arr = data instanceof Uint8Array ? Array.from(data) : data;
  return arr.map((b) => b.toString(10)).join(delimStr);
}
