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
 * Byte-reading and text-decoding utilities for audio metadata parsing.
 *
 * @author d0s1nt [d0s1nt@cyberchefaudio]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

/**
 * Reads 4 bytes and converts them to an ASCII string.
 *
 * @param b - The byte array or Uint8Array to read from.
 * @param off - The offset to start reading from.
 * @returns A 4-character ASCII string, or an empty string if out of bounds.
 */
export function ascii4(b: Uint8Array | number[], off: number): string {
  if (off + 4 > b.length) return "";
  return String.fromCharCode(b[off], b[off + 1], b[off + 2], b[off + 3]);
}

/**
 * Finds the first occurrence of an ASCII string in a byte array.
 *
 * @param b - The byte array to search.
 * @param s - The ASCII string to look for.
 * @param start - The starting offset for the search.
 * @param end - The ending offset for the search.
 * @returns The byte offset of the string, or -1 if not found.
 */
export function indexOfAscii(
  b: Uint8Array | number[],
  s: string,
  start: number,
  end: number,
): number {
  const limit = Math.max(0, Math.min(end, b.length) - s.length);
  for (let i = start; i <= limit; i++) {
    let ok = true;
    for (let j = 0; j < s.length; j++) {
      if (b[i + j] !== s.charCodeAt(j)) {
        ok = false;
        break;
      }
    }
    if (ok) return i;
  }
  return -1;
}

/**
 * Reads an unsigned 32-bit integer in big-endian format.
 *
 * @param bytes - The byte array to read from.
 * @param off - The offset to start reading from.
 * @returns The 32-bit unsigned integer.
 */
export function u32be(bytes: Uint8Array | number[], off: number): number {
  return (
    ((bytes[off] << 24) >>> 0) |
    (bytes[off + 1] << 16) |
    (bytes[off + 2] << 8) |
    bytes[off + 3]
  );
}

/**
 * Reads an unsigned 32-bit integer in little-endian format.
 *
 * @param bytes - The byte array to read from.
 * @param off - The offset to start reading from.
 * @returns The 32-bit unsigned integer.
 */
export function u32le(bytes: Uint8Array | number[], off: number): number {
  return (
    (bytes[off] |
      (bytes[off + 1] << 8) |
      (bytes[off + 2] << 16) |
      (bytes[off + 3] << 24)) >>>
    0
  );
}

/**
 * Reads an unsigned 16-bit integer in little-endian format.
 *
 * @param bytes - The byte array to read from.
 * @param off - The offset to start reading from.
 * @returns The 16-bit unsigned integer.
 */
export function u16le(bytes: Uint8Array | number[], off: number): number {
  return bytes[off] | (bytes[off + 1] << 8);
}

/**
 * Reads an unsigned 64-bit integer in little-endian format.
 *
 * @param bytes - The byte array to read from.
 * @param off - The offset to start reading from.
 * @returns The 64-bit unsigned bigint.
 */
export function u64le(bytes: Uint8Array | number[], off: number): bigint {
  return BigInt(u32le(bytes, off)) | (BigInt(u32le(bytes, off + 4)) << 32n);
}

/**
 * Decodes an ID3v2 synchsafe integer from four 7-bit bytes.
 *
 * @param b0 - The first byte.
 * @param b1 - The second byte.
 * @param b2 - The third byte.
 * @param b3 - The fourth byte.
 * @returns The decoded integer.
 */
export function synchsafeToInt(
  b0: number,
  b1: number,
  b2: number,
  b3: number,
): number {
  return (
    ((b0 & 0x7f) << 21) | ((b1 & 0x7f) << 14) | ((b2 & 0x7f) << 7) | (b3 & 0x7f)
  );
}

/**
 * Decodes a UTF-16LE byte range into a string, stripping null characters.
 *
 * @param b - The Uint8Array to read from.
 * @param off - The offset to start decoding from.
 * @param len - The number of bytes to decode.
 * @returns The decoded and trimmed string.
 */
export function decodeUtf16LE(b: Uint8Array, off: number, len: number): string {
  if (len <= 0 || off + len > b.length) return "";
  try {
    return new TextDecoder("utf-16le")
      .decode(b.slice(off, off + len))
      .replace(/\u0000/g, "")
      .trim();
  } catch {
    return "";
  }
}

/**
 * Reads bytes until a null terminator is found, taking encoding into account for UTF-16.
 *
 * @param bytes - The byte array to read from.
 * @param start - The offset to start reading from.
 * @param encoding - The ID3v2 encoding type (1 or 2 for UTF-16).
 * @returns An object containing the value bytes and the next offset.
 */
export function readNullTerminated(
  bytes: Uint8Array,
  start: number,
  encoding: number,
): { valueBytes: Uint8Array; next: number } {
  const isUtf16 = encoding === 1 || encoding === 2;
  if (!isUtf16) {
    let i = start;
    while (i < bytes.length && bytes[i] !== 0x00) i++;
    return { valueBytes: bytes.slice(start, i), next: i + 1 };
  }
  let i = start;
  while (i + 1 < bytes.length && !(bytes[i] === 0x00 && bytes[i + 1] === 0x00))
    i += 2;
  return { valueBytes: bytes.slice(start, i), next: i + 2 };
}

const ID3_ENCODINGS = ["iso-8859-1", "utf-16", "utf-16be", "utf-8"];

/**
 * Decodes text using the specified ID3v2 encoding byte.
 *
 * @param bytes - The byte array to decode.
 * @param encoding - The encoding byte (0=latin1, 1=utf16, 2=utf16be, 3=utf8).
 * @returns The decoded string.
 */
export function decodeText(bytes: Uint8Array, encoding: number): string {
  if (!bytes || bytes.length === 0) return "";
  try {
    return new TextDecoder(ID3_ENCODINGS[encoding] || "utf-16").decode(bytes);
  } catch {
    return safeUtf8(bytes);
  }
}

/**
 * Decodes a byte array as UTF-8 safely, using replacement characters for invalid sequences.
 *
 * @param bytes - The byte array to decode.
 * @returns The decoded string.
 */
export function safeUtf8(bytes: Uint8Array): string {
  try {
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return "";
  }
}

/**
 * Decodes a byte array as ISO-8859-1 (Latin1), stripping null characters and trimming.
 *
 * @param bytes - The byte array to decode.
 * @returns The decoded and trimmed string.
 */
export function decodeLatin1Trim(bytes: Uint8Array): string {
  return decodeText(bytes, 0)
    .replace(/\u0000/g, "")
    .trim();
}
