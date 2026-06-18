/**
 * @fileoverview Decimal module for ts-chef extension
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Utils } from "../Utils";

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

export function toDecimal(
  data: number[] | Uint8Array,
  delim: string = "Space",
): string {
  const delimStr = Utils.charRep(delim);
  const arr = data instanceof Uint8Array ? Array.from(data) : data;
  return arr.map((b) => b.toString(10)).join(delimStr);
}
