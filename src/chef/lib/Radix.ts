/**
 * @fileoverview Radix module for ts-chef extension
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { OperationError } from "../errors/OperationError";

export const RADIX_DELIM_OPTIONS = [
  "Auto",
  "Space",
  "Comma",
  "Semi-colon",
  "Colon",
  "Line feed",
  "CRLF",
  "None",
];

// Delimiter options without "Auto" — for output operations where explicit choice is required
export const RADIX_DELIM_OPTIONS_TO = RADIX_DELIM_OPTIONS.filter(
  (d) => d !== "Auto",
);

const DELIM_CHARS: Record<string, string> = {
  Space: " ",
  Comma: ",",
  "Semi-colon": ";",
  Colon: ":",
  "Line feed": "\n",
  CRLF: "\r\n",
  None: "",
};

/** Return the literal delimiter character(s) for a delimiter name. */
export function delimChar(name: string): string {
  return Object.prototype.hasOwnProperty.call(DELIM_CHARS, name)
    ? DELIM_CHARS[name]
    : name;
}

/** Detect the most likely delimiter used in the input string. */
export function detectDelim(input: string): string {
  const candidates: [string, string][] = [
    ["Comma", ","],
    ["Semi-colon", ";"],
    ["Colon", ":"],
    ["Line feed", "\n"],
    ["Space", " "],
  ];
  for (const [name, ch] of candidates) {
    if (input.includes(ch)) return name;
  }
  return "None";
}

/**
 * Compute the minimum number of digits needed to represent any byte (0–255)
 * in the given radix, using the formula ceil(8 / log2(radix)).
 *
 * Examples:
 *   radix 2  → 8  (binary bytes)
 *   radix 8  → 3  (octal)
 *   radix 10 → 3  (decimal)
 *   radix 16 → 2  (hex)
 */
export function defaultDigitLen(radix: number): number {
  if (radix < 2) return 8;
  return Math.ceil(8 / Math.log2(radix));
}

/**
 * Parse a radix-encoded string into a byte array.
 *
 * @param input     - Encoded string, e.g. "01100001,00110000,01100100"
 * @param delimName - Delimiter name ("Auto", "Space", "Comma", …, "None")
 * @param radix     - Base for interpretation (2–36)
 * @param digitLen  - Number of characters per token when delimiter is "None"
 */
export function fromRadix(
  input: string,
  delimName: string,
  radix: number,
  digitLen: number,
): number[] {
  if (!input || !input.trim()) return [];
  if (radix < 2 || radix > 36)
    throw new OperationError("Base must be between 2 and 36");
  if (!Number.isInteger(digitLen) || digitLen < 1)
    throw new OperationError("Digit length must be a positive integer");

  const resolved = delimName === "Auto" ? detectDelim(input) : delimName;
  const delim = delimChar(resolved);

  let parts: string[];

  if (delim === "") {
    // "None" mode: strip all whitespace, then chunk into fixed-width slices
    const clean = input.replace(/\s+/g, "");
    if (clean.length % digitLen !== 0) {
      throw new OperationError(
        `Input length ${clean.length} is not divisible by digit length ${digitLen}`,
      );
    }
    parts = [];
    for (let i = 0; i < clean.length; i += digitLen) {
      const chunk = clean.slice(i, i + digitLen);
      if (chunk.length > 0) parts.push(chunk);
    }
  } else {
    parts = input.split(delim);
  }

  return parts
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p, idx) => {
      const invalid = Array.from(p).find((character) => {
        const value = parseInt(character, 36);
        return !/^[0-9a-z]$/i.test(character) || value >= radix;
      });
      if (invalid !== undefined) {
        throw new OperationError(
          `Invalid digit "${invalid}" in "${p}" at token ${idx + 1} for base ${radix}`,
        );
      }
      const n = parseInt(p, radix);
      if (isNaN(n)) {
        throw new OperationError(
          `Invalid value "${p}" at token ${idx + 1} for base ${radix}`,
        );
      }
      if (n < 0 || n > 255) {
        throw new OperationError(
          `Value "${p}" at token ${idx + 1} is outside the byte range 0–255`,
        );
      }
      return n;
    });
}

/**
 * Convert a byte array (or ArrayBuffer / Uint8Array) to a radix-encoded string.
 *
 * @param input     - Bytes to encode
 * @param delimName - Delimiter name ("Space", "Comma", …, "None")
 * @param radix     - Target base (2–36)
 * @param digitLen  - Minimum number of digits per token (zero-padded)
 */
export function toRadix(
  input: number[] | ArrayBuffer | Uint8Array,
  delimName: string,
  radix: number,
  digitLen: number,
): string {
  if (radix < 2 || radix > 36)
    throw new OperationError("Base must be between 2 and 36");

  const delim = delimChar(delimName);

  let bytes: number[];
  if (input instanceof ArrayBuffer) {
    bytes = Array.from(new Uint8Array(input));
  } else if (input instanceof Uint8Array) {
    bytes = Array.from(input);
  } else {
    bytes = input as number[];
  }

  if (!bytes.length) return "";

  return bytes
    .map((b) => (b & 0xff).toString(radix).padStart(digitLen, "0"))
    .join(delim);
}
