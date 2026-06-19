/**
 * @fileoverview CaretMdecode operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";

/**
 * Caret/M-decode operation
 *
 * @category Default
 */
export class CaretMdecode extends TypedOperation<string, number[], unknown[]> {
  /**
   * CaretMdecode constructor
   */
  constructor() {
    super();
    this.name = "Caret/M-decode";
    this.module = "Default";
    this.description =
      "Decodes caret or M-encoded strings, i.e. ^M turns into a newline, M-^] turns into 0x9d.";
    this.infoURL = "https://en.wikipedia.org/wiki/Caret_notation";
    this.inputType = "string";
    this.outputType = "byteArray";
    this.args = [];
  }

  /**
   * @param {string} input - The caret/M-encoded string.
   * @param {unknown[]} _args - Operation arguments (none).
   * @returns {number[]} - The decoded byte array.
   */
  run(input: string, _args: unknown[]): number[] {
    const bytes: number[] = [];
    let prev = "";

    for (let i = 0; i < input.length; i++) {
      const charCode = input.charCodeAt(i);
      const curChar = input.charAt(i);

      if (prev === "M-^") {
        if (charCode > 63 && charCode <= 95) {
          bytes.push(charCode + 64);
        } else if (charCode === 63) {
          bytes.push(255);
        } else {
          bytes.push(77, 45, 94, charCode);
        }
        prev = "";
      } else if (prev === "M-") {
        if (curChar === "^") {
          prev = prev + "^";
        } else if (charCode >= 32 && charCode <= 126) {
          bytes.push(charCode + 128);
          prev = "";
        } else {
          bytes.push(77, 45, charCode);
          prev = "";
        }
      } else if (prev === "M") {
        if (curChar === "-") {
          prev = prev + "-";
        } else {
          bytes.push(77, charCode);
          prev = "";
        }
      } else if (prev === "^") {
        if (charCode > 63 && charCode <= 126) {
          bytes.push(charCode - 64);
        } else if (charCode === 63) {
          bytes.push(127);
        } else {
          bytes.push(94, charCode);
        }
        prev = "";
      } else {
        if (curChar === "M") {
          prev = "M";
        } else if (curChar === "^") {
          prev = "^";
        } else {
          bytes.push(charCode);
        }
      }
    }
    return bytes;
  }
}

export default CaretMdecode;
