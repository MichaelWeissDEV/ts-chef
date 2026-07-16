/**
 * @fileoverview Decimal module for ts-chef extension
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Utils } from "../Utils";
import { OperationError } from "../errors/OperationError";

/**
 * Parses a delimited decimal string into an array of byte values.
 *
 * @param data - The input string of space- or delimiter-separated decimal numbers.
 * @param delim - The delimiter between values; defaults to `"Auto"` (space).
 * @returns An array of numeric byte values parsed from the input.
 */
export function fromDecimal(data: string, delim: string = "Auto"): number[] {
  if (!data.trim()) return [];
  const delimStr = delim === "Auto" ? " " : Utils.charRep(delim);
  return data
    .split(delimStr)
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value, index) => {
      if (!/^[+-]?\d+$/.test(value)) {
        throw new OperationError(
          `Invalid decimal value "${value}" at token ${index + 1}`,
        );
      }
      const parsed = Number(value);
      if (!Number.isSafeInteger(parsed)) {
        throw new OperationError(
          `Decimal value "${value}" at token ${index + 1} is not a safe integer`,
        );
      }
      return parsed;
    });
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
