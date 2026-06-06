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
