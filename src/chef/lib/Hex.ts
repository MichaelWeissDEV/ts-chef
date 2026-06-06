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
import { OperationError } from "../errors/OperationError";

export const TO_HEX_DELIM_OPTIONS = [
  "Space",
  "Percent",
  "Comma",
  "Semi-colon",
  "Colon",
  "Line feed",
  "CRLF",
  "0x",
  "0x with comma",
  "\\x",
  "None",
];

export const FROM_HEX_DELIM_OPTIONS = ["Auto"].concat(TO_HEX_DELIM_OPTIONS);

export function toHex(
  data: number[] | Uint8Array | ArrayBuffer,
  delim: string = " ",
  padding: number = 2,
  extraDelim: string = "",
  lineSize: number = 0,
): string {
  if (!data) return "";
  if (data instanceof ArrayBuffer) data = new Uint8Array(data);
  const arr =
    data instanceof Uint8Array ? Array.from(data) : (data as number[]);

  let output = "";
  const prepend = delim === "0x" || delim === "\\x" || delim === "%";

  for (let i = 0; i < arr.length; i++) {
    const hex = arr[i].toString(16).padStart(padding, "0");
    output += prepend ? delim + hex : hex + delim;

    if (extraDelim) {
      output += extraDelim;
    }
    if (lineSize > 0 && i !== arr.length - 1 && (i + 1) % lineSize === 0) {
      output += "\n";
    }
  }

  const rTruncLen = extraDelim.length + (prepend ? 0 : delim.length);
  if (rTruncLen) {
    return output.slice(0, -rTruncLen);
  }
  return output;
}

export function toHexFast(data: number[] | Uint8Array | ArrayBuffer): string {
  if (!data) return "";
  if (data instanceof ArrayBuffer) data = new Uint8Array(data);
  const arr =
    data instanceof Uint8Array ? Array.from(data) : (data as number[]);

  const output: string[] = [];
  for (let i = 0; i < arr.length; i++) {
    output.push((arr[i] >>> 4).toString(16));
    output.push((arr[i] & 0x0f).toString(16));
  }
  return output.join("");
}

export function fromHex(
  data: string,
  delim: string = "Auto",
  byteLen: number = 2,
): number[] {
  if (byteLen < 1 || Math.round(byteLen) !== byteLen)
    throw new OperationError("Byte length must be a positive integer");

  let parts: string[];
  if (delim !== "None") {
    const delimRegex =
      delim === "Auto" ? /[^a-f\d]|0x/gi : Utils.regexRep(delim);
    parts = data.split(delimRegex);
  } else {
    parts = [data];
  }

  const output: number[] = [];
  for (let i = 0; i < parts.length; i++) {
    for (let j = 0; j < parts[i].length; j += byteLen) {
      const val = parseInt(parts[i].substr(j, byteLen), 16);
      if (!isNaN(val)) output.push(val);
    }
  }
  return output;
}
