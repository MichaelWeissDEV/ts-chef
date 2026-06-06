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

// Lazy imports to avoid circular deps - these are called at runtime
let _fromBase64: ((data: string, alph?: string, ret?: string) => string | number[]) | null = null;
let _fromHex: ((data: string, delim?: string) => number[]) | null = null;
let _fromDecimal: ((data: string, delim?: string) => number[]) | null = null;
let _fromBinary: ((data: string) => number[]) | null = null;

import { OperationError } from "./errors/OperationError";

export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");


/**
 * Utility class providing common helper functions for CyberChef operations.
 * 
 * Includes methods for character encoding, byte array manipulation, 
 * numeric conversions, and data parsing.
 */
export class Utils {
    
    /**
     * Converts a Unicode code point to a string.
     * Handles surrogate pairs for characters outside the Basic Multilingual Plane (BMP).
     * 
     * @param o - The code point to convert.
     * @returns The resulting string.
     */
    static chr(o: number): string {
        if (o > 0xffff) {
            o -= 0x10000;
            const high = String.fromCharCode(((o >>> 10) & 0x3ff) | 0xd800);
            o = 0xdc00 | (o & 0x3ff);
            return high + String.fromCharCode(o);
        }
        return String.fromCharCode(o);
    }

    /**
     * Returns the Unicode code point of the first character in a string.
     * Handles surrogate pairs for characters outside the BMP.
     * 
     * @param c - The character or string.
     * @returns The Unicode code point.
     */
    static ord(c: string): number {
        if (c.length === 2) {
            const high = c.charCodeAt(0);
            const low = c.charCodeAt(1);
            if (high >= 0xd800 && high < 0xdc00 && low >= 0xdc00 && low < 0xe000) {
                return (high - 0xd800) * 0x400 + low - 0xdc00 + 0x10000;
            }
        }
        return c.charCodeAt(0);
    }

    /**
     * Map a letter to its position in the alphabet (0-25).
     * 
     * @param c - The character to convert (should be A-Z).
     * @param permissive - If true, allow lowercase and return -1 for non-letters instead of throwing.
     * @returns Number in range 0-25, or -1 if permissive and input is invalid.
     * @throws {OperationError} If character is invalid and permissive is false.
     */
    static a2i(c: string, permissive: boolean = false): number {
        const i = Utils.ord(c);
        if (i >= 65 && i <= 90) {
            return i - 65;
        }
        if (permissive) {
            if (i >= 97 && i <= 122) {
                return i - 97;
            }
            return -1;
        }
        throw new OperationError("a2i called on non-uppercase ASCII character");
    }

    /**
     * Map a number (0-25) to its corresponding uppercase letter (A-Z).
     * 
     * @param i - The index in the alphabet.
     * @returns The uppercase character.
     * @throws {OperationError} If index is outside 0-25.
     */
    static i2a(i: number): string {
        if (i >= 0 && i < 26) {
            return Utils.chr(i + 65);
        }
        throw new OperationError("i2a called on value outside 0..25");
    }

    /**
     * Converts a character or number to its hexadecimal representation.
     * 
     * @param c - The character or numeric value.
     * @param length - The desired minimum length of the hex string (padded with zeros).
     * @returns The hexadecimal string.
     */
    static hex(c: string | number, length: number = 2): string {
        const n = typeof c === "string" ? Utils.ord(c) : c;
        return n.toString(16).padStart(length, "0");
    }

    /**
     * Converts a character or number to its binary representation.
     * 
     * @param c - The character or numeric value.
     * @param length - The desired minimum length of the binary string (padded with zeros).
     * @returns The binary string.
     */
    static bin(c: string | number, length: number = 8): string {
        const n = typeof c === "string" ? Utils.ord(c) : c;
        return n.toString(2).padStart(length, "0");
    }

    /**
     * Truncates a string to a maximum length and appends a suffix.
     * 
     * @param str - The string to truncate.
     * @param max - The maximum allowed length.
     * @param suffix - The string to append if truncation occurs (e.g., "...").
     * @returns The truncated string.
     */
    static truncate(str: string, max: number, suffix: string = "..."): string {
        if (str.length > max) {
            str = str.slice(0, max - suffix.length) + suffix;
        }
        return str;
    }

    /**
     * Pads a byte array on the right with a specific byte value.
     * 
     * @param arr - The original byte array.
     * @param numBytes - The target length of the array.
     * @param padByte - The byte value to use for padding.
     * @returns A new array of the specified length.
     */
    static padBytesRight(arr: number[], numBytes: number, padByte: number = 0): number[] {
        const paddedBytes = new Array(numBytes).fill(padByte);
        arr.forEach((b, i) => {
            if (i < numBytes) paddedBytes[i] = b;
        });
        return paddedBytes;
    }

    /**
     * Returns the literal string representation for common separator tokens.
     * 
     * @param token - The token name (e.g., 'Space', 'Comma', 'Line feed').
     * @returns The corresponding string value.
     */
    static charRep(token: string): string {
        const map: Record<string, string> = {
            Space: " ",
            Percent: "%",
            Comma: ",",
            "Semi-colon": ";",
            Colon: ":",
            Tab: "\t",
            "Line feed": "\n",
            CRLF: "\r\n",
            "Forward slash": "/",
            Backslash: "\\",
            "0x": "0x",
            "\\x": "\\x",
            "Nothing (separate chars)": "",
            None: "",
        };
        return map[token] ?? "";
    }

    /**
     * Returns a Regular Expression for splitting or searching based on a separator token.
     * 
     * @param token - The token name.
     * @returns The corresponding RegExp.
     */
    static regexRep(token: string): RegExp {
        const map: Record<string, RegExp> = {
            Space: /\s+/g,
            Percent: /%/g,
            Comma: /,/g,
            "Semi-colon": /;/g,
            Colon: /:/g,
            "Line feed": /\n/g,
            CRLF: /\r\n/g,
            "Forward slash": /\//g,
            Backslash: /\\/g,
            "0x with comma": /,?0x/g,
            "0x": /0x/g,
            "\\x": /\\x/g,
            None: /\s+/g,
        };
        return map[token] ?? /\s+/g;
    }

    /**
     * Converts a string to an array of byte values (0-255).
     * Falls back to UTF-8 encoding if the string contains non-Latin1 characters.
     * 
     * @param str - The input string.
     * @returns An array of numbers.
     */
    static strToByteArray(str: string): number[] {
        if (!str) return [];
        const byteArray = new Array(str.length);
        for (let i = str.length - 1; i >= 0; i--) {
            const b = str.charCodeAt(i);
            byteArray[i] = b;
            if (b > 255) return Utils.strToUtf8ByteArray(str);
        }
        return byteArray;
    }

    /**
     * Converts a string to a UTF-8 encoded byte array.
     * 
     * @param str - The input string.
     * @returns An array of numbers representing UTF-8 bytes.
     */
    static strToUtf8ByteArray(str: string): number[] {
        if (!str) return [];
        const encoder = new TextEncoder();
        return Array.from(encoder.encode(str));
    }

    /**
     * Converts a string to an array of Unicode code points.
     * 
     * @param str - The input string.
     * @returns An array of numbers.
     */
    static strToCharcode(str: string): number[] {
        if (!str) return [];
        const charcode: number[] = [];
        for (let i = 0; i < str.length; i++) {
            const code = str.codePointAt(i) ?? 0;
            charcode.push(code);
            if (code > 0xffff) i++;
        }
        return charcode;
    }

    /**
     * Converts a byte array to a string using character codes.
     * 
     * @param byteArray - The array of numbers (0-255).
     * @returns The resulting string.
     */
    static byteArrayToChars(byteArray: number[]): string {
        if (!byteArray || byteArray.length === 0) return "";
        return byteArray.map((b) => String.fromCharCode(b)).join("");
    }

    /**
     * Decodes a byte array as a UTF-8 string.
     * 
     * @param byteArray - The UTF-8 encoded bytes.
     * @returns The decoded string.
     */
    static byteArrayToUtf8(byteArray: number[]): string {
        const buf = Buffer.from(byteArray);
        return buf.toString("utf8");
    }

    /**
     * Converts a byte array to an integer value.
     * 
     * @param byteArray - The bytes representing the number.
     * @param byteorder - The endianness ('big' or 'little').
     * @returns The numeric value.
     */
    static byteArrayToInt(byteArray: number[], byteorder: string): number {
        let value = 0;
        if (byteorder === "big") {
            for (let i = 0; i < byteArray.length; i++) {
                value = value * 256 + byteArray[i];
            }
        } else {
            for (let i = byteArray.length - 1; i >= 0; i--) {
                value = value * 256 + byteArray[i];
            }
        }
        return value;
    }

    /**
     * Converts an integer value to a byte array.
     * 
     * @param value - The number to convert.
     * @param length - The desired number of bytes.
     * @param byteorder - The endianness ('big' or 'little').
     * @returns The resulting byte array.
     */
    static intToByteArray(value: number, length: number, byteorder: string): number[] {
        const arr = new Array(length);
        if (byteorder === "little") {
            for (let i = 0; i < length; i++) {
                arr[i] = value & 0xff;
                value = value >>> 8;
            }
        } else {
            for (let i = length - 1; i >= 0; i--) {
                arr[i] = value & 0xff;
                value = value >>> 8;
            }
        }
        return arr;
    }

    /**
     * Converts a string to an ArrayBuffer.
     * Uses UTF-8 encoding if non-Latin1 characters are present.
     * 
     * @param str - The input string.
     * @returns The resulting ArrayBuffer.
     */
    static strToArrayBuffer(str: string): ArrayBuffer {
        if (!str) return new ArrayBuffer(0);
        const arr = new Uint8Array(str.length);
        for (let i = str.length - 1; i >= 0; i--) {
            const b = str.charCodeAt(i);
            arr[i] = b;
            if (b > 255) return new TextEncoder().encode(str).buffer;
        }
        return arr.buffer;
    }

    /**
     * Converts an ArrayBuffer to a string.
     * 
     * @param arrayBuffer - The buffer to convert.
     * @param utf8 - Whether to decode as UTF-8 (default: true).
     * @returns The resulting string.
     */
    static arrayBufferToStr(arrayBuffer: ArrayBuffer, utf8: boolean = true): string {
        const arr = new Uint8Array(arrayBuffer);
        if (utf8) {
            return new TextDecoder("utf-8").decode(arr);
        }
        return Utils.byteArrayToChars(Array.from(arr));
    }

    /**
     * Parses escaped characters (like \n, \x41, \u1234) in a string.
     * 
     * @param str - The string containing escapes.
     * @returns The unescaped string.
     */
    static parseEscapedChars(str: string): string {
        return str.replace(
            /\\([abfnrtv'"\\]|[0-3][0-7]{2}|[0-7]{1,2}|x[\da-fA-F]{2}|u[\da-fA-F]{4}|u\{[\da-fA-F]{1,6}\})/g,
            (_, a: string) => {
                switch (a[0]) {
                    case "\\":
                        return "\\";
                    case "0":
                    case "1":
                    case "2":
                    case "3":
                    case "4":
                    case "5":
                    case "6":
                    case "7":
                        return String.fromCharCode(parseInt(a, 8));
                    case "a":
                        return String.fromCharCode(7);
                    case "b":
                        return "\b";
                    case "t":
                        return "\t";
                    case "n":
                        return "\n";
                    case "v":
                        return "\v";
                    case "f":
                        return "\f";
                    case "r":
                        return "\r";
                    case '"':
                        return '"';
                    case "'":
                        return "'";
                    case "x":
                        return String.fromCharCode(parseInt(a.slice(1), 16));
                    case "u":
                        if (a[1] === "{") return String.fromCodePoint(parseInt(a.slice(2, -1), 16));
                        return String.fromCharCode(parseInt(a.slice(1), 16));
                    default:
                        return a;
                }
            }
        );
    }

    /**
     * Escapes special characters for use in a Regular Expression.
     * 
     * @param str - The string to escape.
     * @returns The escaped string.
     */
    static escapeRegex(str: string): string {
        return str.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1");
    }

    /**
     * Replaces whitespace characters with their Private Use Area equivalents.
     * Used for preserving whitespace during certain transformations.
     * 
     * @param str - String to escape.
     * @returns Escaped string.
     */
    static escapeWhitespace(str: string): string {
        return str.replace(/[\x09-\x10]/g, (c) => {
            return String.fromCharCode(0xe000 + c.charCodeAt(0));
        });
    }

    /**
     * Returns a new array with duplicate elements removed.
     * 
     * @param arr - Array to unique.
     * @returns Uniqued array.
     */
    static unique<T>(arr: T[]): T[] {
        const u: Record<string, number> = {};
        const a: T[] = [];
        for (let i = 0, l = arr.length; i < l; i++) {
            const key = String(arr[i]);
            if (Object.prototype.hasOwnProperty.call(u, key)) {
                continue;
            }
            a.push(arr[i]);
            u[key] = 1;
        }
        return a;
    }

    /**
     * Expands an alphabet range string (e.g., "a-z", "0-9") into individual characters.
     * 
     * @param alphStr - The range string.
     * @returns An array of characters.
     */
    static expandAlphRange(alphStr: string): string[] {
        const alphArr: string[] = [];
        for (let i = 0; i < alphStr.length; i++) {
            if (i < alphStr.length - 2 && alphStr[i + 1] === "-" && alphStr[i] !== "\\") {
                const start = Utils.ord(alphStr[i]);
                const end = Utils.ord(alphStr[i + 2]);
                for (let j = start; j <= end; j++) {
                    alphArr.push(Utils.chr(j));
                }
                i += 2;
            } else if (i < alphStr.length - 2 && alphStr[i] === "\\" && alphStr[i + 1] === "-") {
                alphArr.push("-");
                i++;
            } else {
                alphArr.push(alphStr[i]);
            }
        }
        return alphArr;
    }

    /**
     * Replaces non-printable characters with dots.
     * 
     * @param str - The input string.
     * @param preserveWs - Whether to preserve common whitespace (tabs, newlines).
     * @returns The printable string.
     */
    static printable(str: string, preserveWs: boolean = false): string {
        const re = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/g;
        const wsRe = /[\x09-\x0d]/g;
        str = str.replace(re, ".");
        if (!preserveWs) str = str.replace(wsRe, ".");
        return str;
    }

    /**
     * Mathematical modulo operation that always returns a positive result.
     * 
     * @param x - The dividend.
     * @param y - The divisor.
     * @returns The positive remainder.
     */
    static mod(x: number, y: number): number {
        return ((x % y) + y) % y;
    }

    /**
     * Calculates the Greatest Common Divisor (GCD) of two numbers.
     * 
     * @param x - First number.
     * @param y - Second number.
     * @returns The GCD.
     */
    static gcd(x: number, y: number): number {
        if (!y) return x;
        return Utils.gcd(y, x % y);
    }

    /**
     * Calculates the Modular Multiplicative Inverse of a number.
     * 
     * @param x - The number.
     * @param y - The modulus.
     * @returns The inverse.
     */
    static modInv(x: number, y: number): number {
        x %= y;
        for (let i = 1; i < y; i++) {
            if ((x * i) % y === 1) return i;
        }
        return 1;
    }

    /**
     * Converts a string to a byte array based on a specified type.
     * 
     * @param str - The input string.
     * @param type - The data type (e.g., 'hex', 'base64', 'utf8').
     * @returns The resulting byte array.
     */
    static convertToByteArray(str: string, type: string): number[] {
        if (!_fromBase64) _fromBase64 = require("./lib/Base64").fromBase64;
        if (!_fromHex) _fromHex = require("./lib/Hex").fromHex;
        if (!_fromDecimal) _fromDecimal = require("./lib/Decimal").fromDecimal;
        if (!_fromBinary) _fromBinary = require("./lib/Binary").fromBinary;

        switch (type.toLowerCase()) {
            case "binary":
                return _fromBinary!(str);
            case "hex":
                return _fromHex!(str);
            case "decimal":
                return _fromDecimal!(str);
            case "base64":
                return _fromBase64!(str, undefined, "byteArray") as number[];
            case "utf8":
                return Utils.strToUtf8ByteArray(str);
            case "latin1":
            default:
                return Utils.strToByteArray(str);
        }
    }

    /**
     * Converts a string to a raw byte string based on a specified type.
     * 
     * @param str - The input string.
     * @param type - The data type (e.g., 'hex', 'base64').
     * @returns The resulting byte string.
     */
    static convertToByteString(str: string, type: string): string {
        if (!_fromBase64) _fromBase64 = require("./lib/Base64").fromBase64;
        if (!_fromHex) _fromHex = require("./lib/Hex").fromHex;
        if (!_fromDecimal) _fromDecimal = require("./lib/Decimal").fromDecimal;
        if (!_fromBinary) _fromBinary = require("./lib/Binary").fromBinary;

        switch (type.toLowerCase()) {
            case "binary":
                return Utils.byteArrayToChars(_fromBinary!(str));
            case "hex":
                return Utils.byteArrayToChars(_fromHex!(str));
            case "decimal":
                return Utils.byteArrayToChars(_fromDecimal!(str));
            case "base64":
                return Utils.byteArrayToChars(
                    _fromBase64!(str, undefined, "byteArray") as number[]
                );
            case "utf8":
                return new TextEncoder()
                    .encode(str)
                    .reduce((a, b) => a + String.fromCharCode(b), "");
            case "latin1":
            default:
                return str;
        }
    }

    /**
     * Removes all HTML tags from a string.
     * 
     * @param str - The input string.
     * @returns The plain text string.
     */
    static stripHtmlTags(str: string): string {
        return str.replace(/<[^>]*>/g, "");
    }

    /**
     * Escapes HTML special characters in a string.
     * 
     * @param str - The string to escape.
     * @returns The escaped string.
     */
    static escapeHtml(str: string): string {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#x27;");
    }

    /**
     * Generator that yields chunks of an iterable.
     * 
     * @param iterable - The collection to chunk.
     * @param chunksize - The maximum size of each chunk.
     */
    static *chunked<T>(iterable: Iterable<T>, chunksize: number): Generator<T[]> {
        const iterator = iterable[Symbol.iterator]();
        while (true) {
            const res: T[] = [];
            let next = iterator.next();
            while (!next.done && res.length < chunksize) {
                res.push(next.value);
                next = iterator.next();
            }
            if (res.length) yield res;
            if (next.done) break;
        }
    }

    /**
     * Parses a CSV string into a 2D array.
     * Supports quoted strings and escaped quotes.
     * 
     * @param data - The CSV data.
     * @param cellDelims - Array of characters that delimit cells (default: [',']).
     * @param lineDelims - Array of characters that delimit lines (default: ['\n', '\r']).
     * @returns A 2D array of strings.
     */
    static parseCSV(
        data: string,
        cellDelims: string[] = [","],
        lineDelims: string[] = ["\n", "\r"]
    ): string[][] {
        let b,
            next,
            renderNext = false,
            inString = false,
            cell = "",
            line: string[] = [];
        const lines: string[][] = [];

        if (data.length && data.charCodeAt(0) === 0xfeff) {
            data = data.slice(1);
        }

        for (let i = 0; i < data.length; i++) {
            b = data[i];
            next = data[i + 1] || "";
            if (renderNext) {
                cell += b;
                renderNext = false;
            } else if (b === '"' && !inString) {
                inString = true;
            } else if (b === '"' && inString) {
                if (next === '"') {
                    renderNext = true;
                } else {
                    inString = false;
                }
            } else if (!inString && cellDelims.indexOf(b) >= 0) {
                line.push(cell);
                cell = "";
            } else if (!inString && lineDelims.indexOf(b) >= 0) {
                line.push(cell);
                cell = "";
                lines.push(line);
                line = [];
                if (lineDelims.indexOf(next) >= 0 && next !== b) {
                    i++;
                }
            } else {
                cell += b;
            }
        }

        if (line.length) {
            line.push(cell);
            lines.push(line);
        }

        return lines;
    }

    /**
     * Encodes a string for use in a URI fragment, following CyberChef's specific encoding.
     * 
     * @param str - The string to encode.
     * @returns The encoded string.
     */
    static encodeURIFragment(str: string): string {
        return encodeURIComponent(str).replace(/%20/g, "+");
    }

    /**
     * Generates a human-readable representation of a recipe configuration.
     * 
     * @param recipeConfig - The recipe configuration object.
     * @param newLine - Whether to separate operations with newlines (default: false).
     * @returns The pretty-printed recipe string.
     */
    static generatePrettyRecipe(recipeConfig: unknown, newLine = false): string {
        if (!Array.isArray(recipeConfig)) return String(recipeConfig);
        return (recipeConfig as Array<{ op: string; args?: unknown[] }>)
            .map(op => op.op + (op.args?.length ? `(${op.args.join(", ")})` : ""))
            .join(newLine ? "\n" : " / ");
    }
}


export default Utils;
