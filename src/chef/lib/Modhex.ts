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

import Utils from "../Utils";
import OperationError from "../errors/OperationError";
import { fromHex, toHex } from "./Hex";

/**
 * Modhex alphabet.
 */
const MODHEX_ALPHABET = "cbdefghijklnrtuv";

/**
 * Modhex alphabet map.
 */
const MODHEX_ALPHABET_MAP = MODHEX_ALPHABET.split("");

/**
 * Hex alphabet to substitute Modhex.
 */
const HEX_ALPHABET = "0123456789abcdef";

/**
 * Hex alphabet map to substitute Modhex.
 */
const HEX_ALPHABET_MAP = HEX_ALPHABET.split("");

/**
 * Convert a byte array into a modhex string.
 *
 * @param {Uint8Array|ArrayBuffer|number[]} data
 * @param {string} [delim=" "]
 * @param {number} [padding=2]
 * @param {string} [extraDelim=""]
 * @param {number} [lineSize=0]
 * @returns {string}
 *
 * @example
 * // returns "cl bf bu"
 * toModhex([10,20,30]);
 *
 * // returns "cl:bf:bu"
 * toModhex([10,20,30], ":");
 */
export function toModhex(
  data: Uint8Array | ArrayBuffer | number[],
  delim: string = " ",
  padding: number = 2,
  extraDelim: string = "",
  lineSize: number = 0,
): string {
  if (!data) return "";
  const uint8Data = data instanceof Uint8Array ? data : new Uint8Array(data);
  if (uint8Data.length === 0) return "";

  const regularHexString = toHex(uint8Data, "", padding, "", 0);

  let modhexString = "";
  for (const letter of regularHexString.split("")) {
    modhexString += MODHEX_ALPHABET_MAP[HEX_ALPHABET_MAP.indexOf(letter)];
  }

  let output = "";
  const groupingRegexp = new RegExp(`.{1,${padding}}`, "g");
  const groupedModhex = modhexString.match(groupingRegexp);

  if (groupedModhex) {
    for (let i = 0; i < groupedModhex.length; i++) {
      const group = groupedModhex[i];
      output += group + delim;

      if (extraDelim) {
        output += extraDelim;
      }
      // Add LF after each lineSize amount of bytes but not at the end
      if (
        i !== groupedModhex.length - 1 &&
        lineSize > 0 &&
        (i + 1) % lineSize === 0
      ) {
        output += "\n";
      }
    }
  }

  // Remove the extraDelim at the end (if there is one)
  // and remove the delim at the end, but if it's prepended there's nothing to remove
  const rTruncLen = extraDelim.length + delim.length;
  if (rTruncLen && output.length >= rTruncLen) {
    // If rTruncLen === 0 then output.slice(0,0) will be returned, which is nothing
    return output.slice(0, -rTruncLen);
  } else {
    return output;
  }
}

/**
 * Convert a byte array into a modhex string as efficiently as possible with no options.
 *
 * @param {Uint8Array|ArrayBuffer|number[]} data
 * @returns {string}
 *
 * @example
 * // returns "clbfbu"
 * toModhexFast([10,20,30]);
 */
export function toModhexFast(
  data: Uint8Array | ArrayBuffer | number[],
): string {
  if (!data) return "";
  const uint8Data = data instanceof Uint8Array ? data : new Uint8Array(data);
  if (uint8Data.length === 0) return "";

  const output: string[] = [];

  for (let i = 0; i < uint8Data.length; i++) {
    output.push(MODHEX_ALPHABET_MAP[(uint8Data[i] >> 4) & 0xf]);
    output.push(MODHEX_ALPHABET_MAP[uint8Data[i] & 0xf]);
  }
  return output.join("");
}

/**
 * Convert a modhex string into a byte array.
 *
 * @param {string} data
 * @param {string} [delim]
 * @param {number} [byteLen=2]
 * @returns {number[]}
 *
 * @example
 * // returns [10,20,30]
 * fromModhex("cl bf bu");
 *
 * // returns [10,20,30]
 * fromModhex("cl:bf:bu", "Colon");
 */
export function fromModhex(
  data: string,
  delim: string = "Auto",
  byteLen: number = 2,
): number[] {
  if (byteLen < 1 || Math.round(byteLen) !== byteLen)
    throw new OperationError("Byte length must be a positive integer");

  // The `.replace(/\s/g, "")` an interesting workaround: Hex "multiline" tests aren't actually
  // multiline. Tests for Modhex fixes that, thus exposing the issue.
  let cleanedData = data.toLowerCase().replace(/\s/g, "");

  let dataParts: string[];
  if (delim !== "None") {
    const delimRegex =
      delim === "Auto" ? /[^cbdefghijklnrtuv]/gi : Utils.regexRep(delim);
    dataParts = cleanedData.split(delimRegex);
  } else {
    dataParts = [cleanedData];
  }

  let regularHexString = "";
  for (let i = 0; i < dataParts.length; i++) {
    for (const letter of dataParts[i].split("")) {
      const index = MODHEX_ALPHABET_MAP.indexOf(letter);
      if (index !== -1) {
        regularHexString += HEX_ALPHABET_MAP[index];
      }
    }
  }

  const output = fromHex(regularHexString, "None", byteLen);
  return output;
}

/**
 * To Modhex delimiters.
 */
export const TO_MODHEX_DELIM_OPTIONS = [
  "Space",
  "Percent",
  "Comma",
  "Semi-colon",
  "Colon",
  "Line feed",
  "CRLF",
  "None",
];

/**
 * From Modhex delimiters.
 */
export const FROM_MODHEX_DELIM_OPTIONS = ["Auto"].concat(
  TO_MODHEX_DELIM_OPTIONS,
);
