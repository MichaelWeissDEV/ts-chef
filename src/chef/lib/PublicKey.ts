/**
 * @fileoverview PublicKey module for ts-chef extension
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { toHex, fromHex } from "./Hex";

/**
 * Formats Distinguished Name (DN) objects to strings.
 *
 * @param {any} dnObj
 * @param {number} indent
 * @returns {string}
 */
interface DistinguishedNameEntry {
  type: string;
  value: unknown;
}

interface DistinguishedName {
  array: DistinguishedNameEntry[][];
}

export function formatDnObj(dnObj: DistinguishedName, indent: number): string {
  let output = "";

  const maxKeyLen = dnObj.array.reduce((max: number, item) => {
    return item[0].type.length > max ? item[0].type.length : max;
  }, 0);

  for (let i = 0; i < dnObj.array.length; i++) {
    if (!dnObj.array[i].length) continue;

    const key = dnObj.array[i][0].type;
    const value = dnObj.array[i][0].value;
    const str = `${key.padEnd(maxKeyLen, " ")} = ${value}\n`;

    output += str.padStart(indent + str.length, " ");
  }

  return output.slice(0, -1);
}

/**
 * Formats byte strings by adding line breaks and delimiters.
 *
 * @param {string} byteStr
 * @param {number} length - Line width
 * @param {number} indent
 * @returns {string}
 */
export function formatByteStr(
  byteStr: string,
  length: number,
  indent: number,
): string {
  const bytes = fromHex(byteStr);
  const hex = toHex(bytes, ":");
  const lineLength = length * 3;
  let output = "";

  for (let i = 0; i < hex.length; i += lineLength) {
    const str = hex.slice(i, i + lineLength) + "\n";
    if (i === 0) {
      output += str;
    } else {
      output += str.padStart(indent + str.length, " ");
    }
  }

  return output.slice(0, output.length - 1);
}
