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

/**
 * Encodes data to a Base64 string.
 *
 * Supports custom alphabets and automatic handling of various input types.
 *
 * @param data - The data to encode (byte array, Uint8Array, ArrayBuffer, or string).
 * @param alphabet - The Base64 alphabet to use (default: 'A-Za-z0-9+/=').
 * @returns The encoded Base64 string.
 * @throws {OperationError} If the alphabet length is invalid.
 */
export function toBase64(
  data: number[] | Uint8Array | ArrayBuffer | string,
  alphabet: string = "A-Za-z0-9+/=",
): string {
  if (!data) return "";
  if (typeof data === "string") {
    data = Utils.strToArrayBuffer(data);
  }
  if (data instanceof ArrayBuffer) {
    data = new Uint8Array(data);
  }

  const alph = Utils.expandAlphRange(alphabet).join("");
  if (alph.length !== 64 && alph.length !== 65) {
    throw new OperationError(
      `Invalid Base64 alphabet length (${alph.length}): ${alph}`,
    );
  }

  const arr =
    data instanceof Uint8Array ? Array.from(data) : (data as number[]);
  let output = "";
  let i = 0;

  while (i < arr.length) {
    const chr1 = arr[i++];
    const chr2 = arr[i++];
    const chr3 = arr[i++];

    const enc1 = chr1 >> 2;
    const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    let enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    let enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }

    output +=
      alph.charAt(enc1) +
      alph.charAt(enc2) +
      (enc3 === 64
        ? alph.length === 65
          ? alph.charAt(64)
          : ""
        : alph.charAt(enc3)) +
      (enc4 === 64
        ? alph.length === 65
          ? alph.charAt(64)
          : ""
        : alph.charAt(enc4));
  }

  return output;
}

/**
 * Decodes a Base64 string into its original form.
 *
 * @param data - The Base64 encoded string.
 * @param alphabet - The Base64 alphabet used for encoding (default: 'A-Za-z0-9+/=').
 * @param returnType - Whether to return a 'string' or a 'byteArray' (default: 'string').
 * @param removeNonAlphChars - Whether to remove non-alphabet characters before decoding (default: true).
 * @param strictMode - Whether to perform strict validation of padding and input length (default: false).
 * @returns The decoded data as a string or byte array.
 * @throws {OperationError} If the alphabet or input is invalid (especially in strict mode).
 */
export function fromBase64(
  data: string,
  alphabet: string = "A-Za-z0-9+/=",
  returnType: "string" | "byteArray" = "string",
  removeNonAlphChars: boolean = true,
  strictMode: boolean = false,
): string | number[] {
  if (!data) {
    return returnType === "string" ? "" : [];
  }

  alphabet = alphabet || "A-Za-z0-9+/=";
  const alph = Utils.expandAlphRange(alphabet).join("");

  if (alph.length !== 64 && alph.length !== 65) {
    throw new OperationError(
      `Error: Base64 alphabet should be 64 characters long, or 65 with a padding character. Found ${alph.length}: ${alph}`,
    );
  }

  if (removeNonAlphChars) {
    const re = new RegExp(
      "[^" + alph.replace(/[[\]\\\-^$]/g, "\\$&") + "]",
      "g",
    );
    data = data.replace(re, "");
  }

  if (strictMode) {
    if (data.length % 4 === 1) {
      throw new OperationError(
        `Error: Invalid Base64 input length (${data.length}). Cannot be 4n+1, even without padding chars.`,
      );
    }
    if (alph.length === 65) {
      const pad = alph.charAt(64);
      const padPos = data.indexOf(pad);
      if (padPos >= 0) {
        if (padPos < data.length - 2 || data.charAt(data.length - 1) !== pad) {
          throw new OperationError(
            `Error: Base64 padding character (${pad}) not used in the correct place.`,
          );
        }
        if (data.length % 4 !== 0) {
          throw new OperationError(
            "Error: Base64 not padded to a multiple of 4.",
          );
        }
      }
    }
  }

  const output: number[] = [];
  let i = 0;

  while (i < data.length) {
    const enc1 = alph.indexOf(data.charAt(i++) || "\0");
    const enc2 = alph.indexOf(data.charAt(i++) || "\0");
    const enc3 = alph.indexOf(data.charAt(i++) || "\0");
    const enc4 = alph.indexOf(data.charAt(i++) || "\0");

    if (strictMode && (enc1 < 0 || enc2 < 0 || enc3 < 0 || enc4 < 0)) {
      throw new OperationError(
        "Error: Base64 input contains non-alphabet char(s)",
      );
    }

    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;

    if (chr1 >= 0 && chr1 <= 255) output.push(chr1);
    if (enc3 !== -1 && enc3 !== 64 && chr2 >= 0 && chr2 <= 255)
      output.push(chr2);
    if (enc4 !== -1 && enc4 !== 64 && chr3 >= 0 && chr3 <= 255)
      output.push(chr3);
  }

  if (returnType === "string") {
    return Utils.byteArrayToChars(output);
  }
  return output;
}
