/**
 * @fileoverview Delim module for ts-chef extension
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

export const DELIM_OPTIONS = [
  "Space",
  "Comma",
  "Semi-colon",
  "Colon",
  "Line feed",
  "CRLF",
];

export const BIN_DELIM_OPTIONS = [
  "Space",
  "Comma",
  "Semi-colon",
  "Colon",
  "Line feed",
  "CRLF",
  "None",
];

export const LETTER_DELIM_OPTIONS = [
  "Space",
  "Line feed",
  "CRLF",
  "Forward slash",
  "Backslash",
  "Comma",
  "Semi-colon",
  "Colon",
];

export const WORD_DELIM_OPTIONS = [
  "Line feed",
  "CRLF",
  "Forward slash",
  "Backslash",
  "Comma",
  "Semi-colon",
  "Colon",
];

export const INPUT_DELIM_OPTIONS = [
  "Line feed",
  "CRLF",
  "Space",
  "Comma",
  "Semi-colon",
  "Colon",
  "Nothing (separate chars)",
];

export const ARITHMETIC_DELIM_OPTIONS = [
  "Line feed",
  "Space",
  "Comma",
  "Semi-colon",
  "Colon",
  "CRLF",
];

export const HASH_DELIM_OPTIONS = ["Line feed", "CRLF", "Space", "Comma"];

export const IP_DELIM_OPTIONS = [
  "Line feed",
  "CRLF",
  "Space",
  "Comma",
  "Semi-colon",
];

export const SPLIT_DELIM_OPTIONS = [
  { name: "Comma", value: "," },
  { name: "Space", value: " " },
  { name: "Line feed", value: "\\n" },
  { name: "CRLF", value: "\\r\\n" },
  { name: "Semi-colon", value: ";" },
  { name: "Colon", value: ":" },
  { name: "Nothing (separate chars)", value: "" },
];

export const JOIN_DELIM_OPTIONS = [
  { name: "Line feed", value: "\\n" },
  { name: "CRLF", value: "\\r\\n" },
  { name: "Space", value: " " },
  { name: "Comma", value: "," },
  { name: "Semi-colon", value: ";" },
  { name: "Colon", value: ":" },
  { name: "Nothing (join chars)", value: "" },
];
