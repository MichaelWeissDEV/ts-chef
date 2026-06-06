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

import { Operation } from "../Operation";
import OperationError from "../errors/OperationError";

/* ---------- helper functions ---------- */

/**
 * Convert text to BigInt (big-endian byte interpretation)
 */
function textToBigInt(text: string) {
  if (text.length === 0) return 0n;

  let result = 0n;
  for (let i = 0; i < text.length; i++) {
    const charCode = BigInt(text.charCodeAt(i));
    if (charCode > 255n) {
      throw new OperationError(
        `Character at position ${i} exceeds Latin-1 range (0-255).\n` +
          "Only ASCII and Latin-1 characters are supported.",
      );
    }
    result = (result << 8n) | charCode;
  }
  return result;
}

/**
 * Convert BigInt to text (big-endian byte interpretation)
 */
function bigIntToText(value: bigint) {
  if (value === 0n) return "";

  const bytes = [];
  let num = value;

  while (num > 0n) {
    bytes.unshift(Number(num & 0xffn));
    num >>= 8n;
  }

  return String.fromCharCode(...bytes);
}

/* ---------- operation class ---------- */

/**
 * Text/Integer Converter operation
 */
export class TextIntegerConverter extends Operation {
  /**
   * TextIntegerConverter constructor
   */
  constructor() {
    super();

    this.description =
      "Converts between text strings and large integers (decimal or hexadecimal).<br><br>" +
      "Text is interpreted as a big-endian sequence of character codes. For example:<br>" +
      "ABC is 0x414243 (hex) is 4276803 (decimal)<br>" +
      "<b>Input format detection:</b><br>" +
      "Decimal: digits 0-9 only<br>" +
      "Hexadecimal: 0x... prefix<br>" +
      "Quoted or unquoted text: treated as string<br><br>" +
      "<b>Character limitations:</b><br>" +
      "Text input may only contain ASCII and Latin-1 characters (code point < 256).<br>" +
      "Multi-byte Unicode characters will generate an error.<br><br>.";
    this.infoURL = "https://wikipedia.org/wiki/Endianness";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Output format",
        type: "option",
        value: ["String", "Decimal", "Hexadecimal"],
      },
    ];
    this.name = "Text-Integer Conversion";
    this.module = "Default";
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const outputFormat = args[0];
    const trimmed = input.trim();

    let bigIntValue;

    if (!trimmed) {
      // Null input - treat as zero
      bigIntValue = 0n;
    } else if (
      /^0x[0-9a-f]+$/i.test(trimmed) ||
      /^[+-]?[0-9]+$/.test(trimmed)
    ) {
      // Hex or decimal integer
      bigIntValue = BigInt(trimmed);
    } else if (/^["'].*["']$/.test(trimmed)) {
      // Quoted string: Remove quotes and convert text to BigInt
      const text = trimmed.slice(1, -1);
      bigIntValue = textToBigInt(text);
    } else {
      // Assume it's unquoted text
      bigIntValue = textToBigInt(trimmed);
    }

    // Convert to output format
    if (outputFormat === "String") {
      return bigIntToText(bigIntValue);
    } else if (outputFormat === "Decimal") {
      return bigIntValue.toString();
    } else {
      // Hexadecimal
      return "0x" + bigIntValue.toString(16);
    }
  }
}

export default TextIntegerConverter;
