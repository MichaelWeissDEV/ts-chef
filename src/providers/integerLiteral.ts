/**
 * Language-aware integer literal parsing used by the instant conversion hover.
 * This module deliberately has no VS Code dependency so the parser can be
 * exercised with ordinary unit tests.
 */

export type IntegerFormat = "decimal" | "hex" | "binary" | "octal";

export interface IntegerLiteralAnalysis {
  raw: string;
  value: bigint;
  magnitude: bigint;
  radix: 2 | 8 | 10 | 16;
  suffix: string;
  explicitWidth?: number;
  bitWidth: number;
  fitsWidth: boolean;
  warning?: string;
  unsignedAtWidth: bigint;
  signedAtWidth: bigint;
  decimal: string;
  hex: string;
  binary: string;
  octal: string;
  twosComplementHex: string;
  twosComplementBinary: string;
}

export interface LocatedIntegerLiteral {
  start: number;
  end: number;
  analysis: IntegerLiteralAnalysis;
}

const INTEGER_CANDIDATE =
  /[+-]?(?:0[xX][0-9a-fA-F](?:[0-9a-fA-F_']*[0-9a-fA-F])?|0[bB][01](?:[01_']*[01])?|0[oO][0-7](?:[0-7_']*[0-7])?|[0-9](?:[0-9_']*[0-9])?)(?:[iu](?:8|16|32|64|128|size)|[uUlL]{1,3}|[nN])?/g;

const C_STYLE_OCTAL_LANGUAGES = new Set([
  "c",
  "cpp",
  "cuda-cpp",
  "java",
  "go",
  "objective-c",
  "objective-cpp",
]);

function bitLength(value: bigint): number {
  if (value === 0n) return 1;
  return value.toString(2).length;
}

function representationWidth(radix: number, digits: string): number {
  if (radix === 16) return digits.length * 4;
  if (radix === 8) return digits.length * 3;
  if (radix === 2) return digits.length;
  return 0;
}

function suffixWidth(suffix: string): number | undefined {
  const rust = /^[iu](8|16|32|64|128)$/i.exec(suffix);
  if (rust) return Number(rust[1]);
  if (/^[iu]size$/i.test(suffix)) return 64;
  if (/ll/i.test(suffix)) return 64;
  if (/l/i.test(suffix)) return 32;
  if (/u/i.test(suffix)) return 32;
  return undefined;
}

function roundWidth(bits: number): number {
  for (const width of [8, 16, 32, 64, 128]) {
    if (bits <= width) return width;
  }
  return Math.ceil(bits / 8) * 8;
}

function inferWidth(
  value: bigint,
  magnitude: bigint,
  radix: number,
  digits: string,
  suffix: string,
): number {
  const explicit = suffixWidth(suffix);
  if (explicit) return explicit;

  const required =
    value < 0n ? bitLength(magnitude === 0n ? 0n : magnitude - 1n) + 1 : bitLength(value);
  const represented = representationWidth(radix, digits);
  return roundWidth(Math.max(required, represented));
}

function groupRight(value: string, size: number): string {
  const groups: string[] = [];
  for (let end = value.length; end > 0; end -= size) {
    groups.unshift(value.slice(Math.max(0, end - size), end));
  }
  return groups.join("_");
}

function magnitudeText(value: bigint, radix: number): string {
  return value.toString(radix);
}

/** Parse one complete source-code integer literal. */
export function analyseIntegerLiteral(
  raw: string,
  languageId = "",
): IntegerLiteralAnalysis | undefined {
  const candidate = raw.trim();
  if (!candidate || candidate.length > 4096) return undefined;

  const whole = new RegExp(`^(?:${INTEGER_CANDIDATE.source})$`).exec(candidate);
  if (!whole) return undefined;

  let cursor = candidate;
  let negative = false;
  if (cursor[0] === "+" || cursor[0] === "-") {
    negative = cursor[0] === "-";
    cursor = cursor.slice(1);
  }

  const suffixMatch = /([iu](?:8|16|32|64|128|size)|[uUlL]{1,3}|[nN])$/i.exec(cursor);
  const suffix = suffixMatch?.[1] ?? "";
  if (suffix) cursor = cursor.slice(0, -suffix.length);

  let radix: 2 | 8 | 10 | 16 = 10;
  if (/^0[xX]/.test(cursor)) radix = 16;
  else if (/^0[bB]/.test(cursor)) radix = 2;
  else if (/^0[oO]/.test(cursor)) radix = 8;
  else if (
    /^0[0-7]+$/.test(cursor) &&
    cursor.length > 1 &&
    C_STYLE_OCTAL_LANGUAGES.has(languageId)
  )
    radix = 8;

  const prefixLength = /^0[xX]|^0[bB]|^0[oO]/.test(cursor) ? 2 : 0;
  const digits = cursor.slice(prefixLength).replace(/[_']/g, "");
  if (!digits) return undefined;

  let magnitude: bigint;
  try {
    const prefix = radix === 16 ? "0x" : radix === 8 ? "0o" : radix === 2 ? "0b" : "";
    magnitude = BigInt(`${prefix}${digits}`);
  } catch {
    return undefined;
  }

  const value = negative ? -magnitude : magnitude;
  const explicitWidth = suffixWidth(suffix);
  const bitWidth = inferWidth(value, magnitude, radix, digits, suffix);
  const modulus = 1n << BigInt(bitWidth);
  const unsignedAtWidth = ((value % modulus) + modulus) % modulus;
  const signBit = 1n << BigInt(bitWidth - 1);
  const signedAtWidth =
    unsignedAtWidth >= signBit ? unsignedAtWidth - modulus : unsignedAtWidth;
  const hexDigits = Math.ceil(bitWidth / 4);
  const unsignedHint = /u/i.test(suffix);
  const minimum = unsignedHint ? 0n : -(1n << BigInt(bitWidth - 1));
  const maximum = unsignedHint
    ? (1n << BigInt(bitWidth)) - 1n
    : (1n << BigInt(bitWidth - 1)) - 1n;
  const fitsWidth =
    explicitWidth === undefined || (value >= minimum && value <= maximum);

  const sign = value < 0n ? "-" : "";
  const abs = value < 0n ? -value : value;
  return {
    raw: candidate,
    value,
    magnitude,
    radix,
    suffix,
    explicitWidth,
    bitWidth,
    fitsWidth,
    warning: fitsWidth
      ? undefined
      : `Value does not fit the declared ${unsignedHint ? "unsigned " : "signed "}${bitWidth}-bit type`,
    unsignedAtWidth,
    signedAtWidth,
    decimal: value.toString(10),
    hex: `${sign}0x${magnitudeText(abs, 16)}`,
    binary: `${sign}0b${groupRight(magnitudeText(abs, 2), 4)}`,
    octal: `${sign}0o${groupRight(magnitudeText(abs, 8), 3)}`,
    twosComplementHex: `0x${unsignedAtWidth.toString(16).padStart(hexDigits, "0")}`,
    twosComplementBinary: groupRight(
      unsignedAtWidth.toString(2).padStart(bitWidth, "0"),
      4,
    ),
  };
}

function isBoundary(text: string, start: number, end: number): boolean {
  const before = text[start - 1] ?? "";
  const after = text[end] ?? "";
  // Do not offer integer conversions for a fragment of an identifier or float.
  return !/[\w.$]/.test(before) && !/[\w.$]/.test(after);
}

/** Locate the integer literal containing `offset` in one line of source. */
export function findIntegerLiteralAt(
  text: string,
  offset: number,
  languageId = "",
): LocatedIntegerLiteral | undefined {
  INTEGER_CANDIDATE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = INTEGER_CANDIDATE.exec(text)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    if (offset < start || offset > end) continue;
    if (!isBoundary(text, start, end) && /^[+-]/.test(match[0])) {
      const unsignedStart = start + 1;
      if (isBoundary(text, unsignedStart, end)) {
        const analysis = analyseIntegerLiteral(match[0].slice(1), languageId);
        if (analysis) return { start: unsignedStart, end, analysis };
      }
      continue;
    }
    if (!isBoundary(text, start, end)) continue;
    const analysis = analyseIntegerLiteral(match[0], languageId);
    if (analysis) return { start, end, analysis };
  }
  return undefined;
}

/** Format a parsed value as a source-code literal, preserving useful suffixes. */
export function formatIntegerLiteral(
  analysis: IntegerLiteralAnalysis,
  format: IntegerFormat,
  languageId = "",
): string {
  const negative = analysis.value < 0n;
  const magnitude = negative ? -analysis.value : analysis.value;
  const sign = negative ? "-" : "";
  let body: string;
  switch (format) {
    case "hex":
      body = `0x${magnitude.toString(16)}`;
      break;
    case "binary":
      body = `0b${magnitude.toString(2)}`;
      break;
    case "octal": {
      const digits = magnitude.toString(8);
      body = C_STYLE_OCTAL_LANGUAGES.has(languageId) && magnitude !== 0n
        ? `0${digits}`
        : `0o${digits}`;
      break;
    }
    default:
      body = magnitude.toString(10);
  }
  return `${sign}${body}${analysis.suffix}`;
}
