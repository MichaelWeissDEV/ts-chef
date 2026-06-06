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
