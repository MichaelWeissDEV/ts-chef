/**
 * @fileoverview DateTime module for ts-chef extension
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

export const UNITS = [
  "Seconds (s)",
  "Milliseconds (ms)",
  "Microseconds (us)",
  "Nanoseconds (ns)",
];

export const DATETIME_FORMATS = [
  { name: "Standard date and time", value: "DD/MM/YYYY HH:mm:ss" },
  { name: "American-style date and time", value: "MM/DD/YYYY HH:mm:ss" },
  { name: "International date and time", value: "YYYY-MM-DD HH:mm:ss" },
  { name: "Verbose date and time", value: "dddd Do MMMM YYYY HH:mm:ss" },
  { name: "UNIX timestamp (seconds)", value: "X" },
  { name: "UNIX timestamp (milliseconds)", value: "x" },
];

export const FORMAT_EXAMPLES = `Examples:
- DD/MM/YYYY HH:mm:ss
- MM/DD/YYYY HH:mm:ss
- YYYY-MM-DD HH:mm:ss
- dddd Do MMMM YYYY HH:mm:ss
- X (UNIX timestamp in seconds)
- x (UNIX timestamp in milliseconds)`;
