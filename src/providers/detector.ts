/**
 * @fileoverview detector provider for VS Code extension functionality
 * @package providers
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import * as vscode from "vscode";

export interface DetectionMatch {
  range: vscode.Range;
  value: string;
  matches: DetectionResult[];
}

export interface DetectionResult {
  label: string;
  opName: string;
  defaultArgs: unknown[];
  confidence: number;
  /** Exact captured value to feed to the operation when analysing a larger wrapper. */
  inputValue?: string;
}

/** A detector match using plain string offsets, suitable for on-demand hovers. */
export interface DetectionSpan {
  start: number;
  end: number;
  value: string;
  matches: DetectionResult[];
}

interface PatternDef {
  label: string;
  opName: string;
  defaultArgs: unknown[];
  pattern: RegExp;
  confidence: (m: RegExpExecArray) => number;
  /** Cheap guard for patterns that would otherwise inspect irrelevant input. */
  prefilter?: (text: string) => boolean;
  /** Context check for matches whose delimiters cannot be expressed safely in one regex. */
  accept?: (match: RegExpExecArray, text: string) => boolean;
}

function entropyScore(s: string): number {
  const freq: Record<string, number> = {};
  for (const c of s) freq[c] = (freq[c] ?? 0) + 1;
  let e = 0;
  for (const cnt of Object.values(freq)) {
    const p = cnt / s.length;
    e -= p * Math.log2(p);
  }
  return e / 8;
}

function decodedBase64PrintableRatio(value: string): number {
  try {
    const bytes = Buffer.from(value, "base64");
    if (!bytes.length) return 0;
    let printable = 0;
    for (const byte of bytes) {
      if (
        byte === 9 ||
        byte === 10 ||
        byte === 13 ||
        (byte >= 32 && byte <= 126)
      )
        printable++;
    }
    return printable / bytes.length;
  } catch {
    return 0;
  }
}

function isHexCharacter(code: number): boolean {
  return (
    (code >= 48 && code <= 57) ||
    (code >= 65 && code <= 70) ||
    (code >= 97 && code <= 102)
  );
}

function hasAtLeastTwoPercentEscapes(text: string): boolean {
  let count = 0;
  for (
    let index = text.indexOf("%");
    index !== -1;
    index = text.indexOf("%", index + 1)
  ) {
    if (
      isHexCharacter(text.charCodeAt(index + 1)) &&
      isHexCharacter(text.charCodeAt(index + 2))
    ) {
      count++;
      if (count === 2) return true;
    }
  }
  return false;
}

const PATTERNS: PatternDef[] = [
  // ── Base64 (standard) ──────────────────────────────────────────────────
  {
    label: "Base64",
    opName: "FromBase64",
    defaultArgs: ["A-Za-z0-9+/=", true, false],
    pattern: /(?<![A-Za-z0-9+/])([A-Za-z0-9+/]{20,}={0,2})(?![A-Za-z0-9+/=])/g,
    accept: (match, text) => {
      const start = match.index;
      // A single '=' commonly separates an environment/source assignment
      // from its payload. Two adjacent '=' characters are Base64 padding, so
      // never start a fresh token in the middle of that padding.
      return !(
        start >= 2 &&
        text.charCodeAt(start - 1) === 61 &&
        text.charCodeAt(start - 2) === 61
      );
    },
    confidence: (m) => {
      const s = m[1];
      if (s.length % 4 !== 0) return 0.6;
      const printable = decodedBase64PrintableRatio(s);
      if (/^[A-Za-z]+$/.test(s)) {
        // Long camelCase/PascalCase identifiers are much more common in source
        // code than unpadded, letters-only Base64. Keep them below the default
        // hover threshold even if their accidental decoding happens to print.
        if (/^[a-z]/.test(s) && /[a-z][A-Z]/.test(s)) return 0.25;
        if (printable < 0.85) return 0.45;
      }
      return Math.min(
        0.95,
        0.68 + entropyScore(s) * 0.2 + printable * 0.22,
      );
    },
  },
  // ── Base64url (uses - and _ instead of + and /) ────────────────────────
  {
    label: "Base64url",
    opName: "FromBase64",
    defaultArgs: ["A-Za-z0-9-_", true, false],
    pattern: /(?<![A-Za-z0-9\-_])([A-Za-z0-9\-_]{20,})(?![A-Za-z0-9\-_=])/g,
    confidence: (m) => {
      const s = m[1];
      if (!/[-_]/.test(s)) return 0; // must have at least one url-safe char
      return Math.min(0.9, 0.65 + entropyScore(s) * 0.3);
    },
  },
  // ── Hex string ────────────────────────────────────────────────────────
  {
    label: "Hex string",
    opName: "FromHex",
    defaultArgs: ["Auto"],
    pattern: /(?:0x)?([0-9a-fA-F]{8,})\b/g,
    confidence: (m) => {
      const s = m[1];
      if (s.length % 2 !== 0) return 0.5;
      return s.length >= 32 ? 0.85 : 0.65;
    },
  },
  // ── Hex with separators (aa:bb:cc or aa-bb-cc or aa bb cc) ────────────
  {
    label: "Hex (colon-separated)",
    opName: "FromHex",
    defaultArgs: ["Colon"],
    pattern: /\b([0-9a-fA-F]{2}(?::[0-9a-fA-F]{2}){3,})\b/g,
    confidence: () => 0.88,
  },
  {
    label: "Hex (space-separated)",
    opName: "FromHex",
    defaultArgs: ["Space"],
    pattern: /\b([0-9a-fA-F]{2}(?: [0-9a-fA-F]{2}){3,})\b/g,
    confidence: () => 0.96,
  },
  // ── MD5 hash ───────────────────────────────────────────────────────────
  {
    label: "MD5 hash",
    opName: "AnalyseHash",
    defaultArgs: [],
    pattern: /\b([0-9a-fA-F]{32})\b/g,
    confidence: () => 0.96,
  },
  // ── SHA-1 hash ─────────────────────────────────────────────────────────
  {
    label: "SHA-1 hash",
    opName: "AnalyseHash",
    defaultArgs: [],
    pattern: /\b([0-9a-fA-F]{40})\b/g,
    confidence: () => 0.97,
  },
  // ── SHA-256 hash ───────────────────────────────────────────────────────
  {
    label: "SHA-256 hash",
    opName: "AnalyseHash",
    defaultArgs: [],
    pattern: /\b([0-9a-fA-F]{64})\b/g,
    confidence: () => 0.98,
  },
  // ── SHA-512 hash ───────────────────────────────────────────────────────
  {
    label: "SHA-512 hash",
    opName: "AnalyseHash",
    defaultArgs: [],
    pattern: /\b([0-9a-fA-F]{128})\b/g,
    confidence: () => 0.99,
  },
  // ── JWT ────────────────────────────────────────────────────────────────
  {
    label: "JWT",
    opName: "JWTDecode",
    defaultArgs: [],
    pattern: /\b(eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*)\b/g,
    confidence: () => 0.97,
  },
  // ── URL encoded ────────────────────────────────────────────────────────
  {
    label: "URL encoded",
    opName: "URLDecode",
    defaultArgs: [],
    pattern: /([^\s"'`%]*(?:%[0-9A-Fa-f]{2}[^\s"'`%]*){2,})/g,
    prefilter: hasAtLeastTwoPercentEscapes,
    confidence: (m) =>
      Math.min(
        0.95,
        0.75 + (m[1].match(/%[0-9A-Fa-f]{2}/g)?.length ?? 0) * 0.02,
      ),
  },
  // ── HTML entities ──────────────────────────────────────────────────────
  {
    label: "HTML entities",
    opName: "FromHTMLEntity",
    defaultArgs: [],
    pattern: /((?:&(?:#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);){2,})/g,
    confidence: () => 0.9,
  },
  // ── Unix timestamp (seconds) ───────────────────────────────────────────
  {
    label: "Unix timestamp",
    opName: "FromUNIXTimestamp",
    defaultArgs: ["Seconds (s)"],
    pattern: /\b(1[0-9]{9})\b/g,
    confidence: () => 0.75,
  },
  // ── Unix timestamp (milliseconds) ─────────────────────────────────────
  {
    label: "Unix timestamp (ms)",
    opName: "FromUNIXTimestamp",
    defaultArgs: ["Milliseconds (ms)"],
    pattern: /\b(1[0-9]{12})\b/g,
    confidence: () => 0.72,
  },
  // ── Hex dump ───────────────────────────────────────────────────────────
  {
    label: "Hex dump",
    opName: "FromHexdump",
    defaultArgs: [],
    pattern: /^(?:[0-9a-fA-F]{4,16}:?\s+(?:[0-9a-fA-F]{2}\s+){7,15}.+\n)+/gm,
    confidence: () => 0.92,
  },
  // ── UUID ───────────────────────────────────────────────────────────────
  {
    label: "UUID",
    opName: "AnalyseUUID",
    defaultArgs: [],
    pattern:
      /\b([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\b/g,
    confidence: () => 0.95,
  },
  // ── PEM / DER keys ─────────────────────────────────────────────────────
  {
    label: "PEM block",
    opName: "PubKeyFromCert",
    defaultArgs: [],
    pattern: /(-----BEGIN [A-Z ]+-----[\s\S]+?-----END [A-Z ]+-----)/g,
    confidence: () => 0.96,
  },
  // ── Escaped Unicode sequences ──────────────────────────────────────────
  {
    label: "Escaped Unicode",
    opName: "UnescapeUnicodeCharacters",
    defaultArgs: ["\\u"],
    pattern: /((?:\\u[0-9a-fA-F]{4}){2,})/g,
    confidence: () => 0.9,
  },
  // ── Charcode / decimal bytes ───────────────────────────────────────────
  {
    label: "Char codes",
    opName: "FromCharcode",
    defaultArgs: ["Comma", 10],
    pattern: /\b((?:\d{1,3},\s*){3,}\d{1,3})\b/g,
    confidence: (m) => {
      const nums = m[1].split(",").map((n) => parseInt(n.trim(), 10));
      const allValid = nums.every((n) => n >= 32 && n <= 126);
      return allValid ? 0.78 : 0.45;
    },
  },
  // ── Base32 ─────────────────────────────────────────────────────────────
  {
    label: "Base32",
    opName: "FromBase32",
    defaultArgs: ["A-Z2-7=", true],
    pattern: /\b([A-Z2-7]{8,}={0,6})\b/g,
    confidence: (m) => {
      const s = m[1];
      if (s.length % 8 !== 0) return 0.55;
      return 0.82;
    },
  },
  // ── Binary string (space-separated) ───────────────────────────────────
  {
    label: "Binary",
    opName: "FromBinary",
    defaultArgs: ["Space"],
    pattern: /\b([01]{8}(?:\s[01]{8}){3,})\b/g,
    confidence: () => 0.88,
  },
  // ── Binary string (comma-separated) ───────────────────────────────────
  {
    label: "Binary (comma-separated)",
    opName: "FromRadix",
    defaultArgs: ["Comma", 2, 8],
    pattern: /([01]{4,}(?:,[01]{4,}){2,})/g,
    confidence: (m) => {
      const tokens = m[1].split(",");
      const allBytes = tokens.every((t) => t.length === 8);
      return allBytes ? 0.92 : 0.72;
    },
  },
  // ── Octal string (space-separated) ────────────────────────────────────
  {
    label: "Octal",
    opName: "FromRadix",
    defaultArgs: ["Space", 8, 3],
    pattern: /\b([0-7]{3}(?:\s[0-7]{3}){3,})\b/g,
    confidence: () => 0.75,
  },
  // ── bcrypt hash ────────────────────────────────────────────────────────
  {
    label: "bcrypt hash",
    opName: "AnalyseHash",
    defaultArgs: [],
    pattern: /(\$2[abxy]?\$\d{2}\$[./A-Za-z0-9]{53})/g,
    confidence: () => 0.96,
  },
  // ── Base64 payload of a data: URI ──────────────────────────────────────
  {
    label: "Data URI (Base64)",
    opName: "FromBase64",
    defaultArgs: ["A-Za-z0-9+/=", true, false],
    pattern: /data:[a-z0-9.+/-]+;base64,([A-Za-z0-9+/]{8,}={0,2})/gi,
    confidence: () => 0.95,
  },
  // ── \x-escaped hex bytes (shellcode / JS string escapes) ───────────────
  {
    label: "Hex (\\x-escaped)",
    opName: "FromHex",
    defaultArgs: ["\\x"],
    pattern: /((?:\\x[0-9a-fA-F]{2}){4,})/g,
    confidence: () => 0.93,
  },
  // ── ROT13 (high letter-only entropy strings) ───────────────────────────
  {
    label: "ROT13",
    opName: "ROT13",
    defaultArgs: [true, true, false, 13],
    pattern: /\b([A-Za-z]{8,})\b/g,
    confidence: (m) => {
      // Only flag if entropy suggests it's a scrambled word sequence, not normal text
      const s = m[1];
      const vowelRatio = (s.match(/[aeiouAEIOU]/g)?.length ?? 0) / s.length;
      // Normal English text has vowel ratio ~0.38; ROT13'd text often shifts this
      return vowelRatio < 0.15 || vowelRatio > 0.6 ? 0.72 : 0;
    },
  },
];

/** Analyse a single string value — returns ranked DetectionResult[] without doc ranges. */
export function analyseValue(value: string): DetectionResult[] {
  const trimmed = value.trim();
  const results: DetectionResult[] = [];

  for (const def of PATTERNS) {
    if (def.prefilter && !def.prefilter(trimmed)) continue;
    const re = new RegExp(
      def.pattern.source,
      def.pattern.flags.replace("g", ""),
    );
    const m = re.exec(trimmed);
    if (!m) continue;
    if (def.accept && !def.accept(m, trimmed)) continue;
    const matched = m[1] ?? m[0];
    if (m[0].length < trimmed.length * 0.65) continue;
    const conf = def.confidence(m);
    if (conf < 0.3) continue;
    if (!results.some((r) => r.label === def.label)) {
      results.push({
        label: def.label,
        opName: def.opName,
        defaultArgs: def.defaultArgs,
        confidence: conf,
        inputValue: matched,
      });
    }
  }
  return results.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Scan plain text without constructing VS Code ranges. This is intentionally
 * exported so hover analysis can inspect only the line under the cursor instead
 * of rescanning an entire document on every mouse movement.
 */
export function scanString(text: string): DetectionSpan[] {
  const results: DetectionSpan[] = [];

  for (const def of PATTERNS) {
    if (def.prefilter && !def.prefilter(text)) continue;
    const re = new RegExp(def.pattern.source, def.pattern.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (def.accept && !def.accept(m, text)) continue;
      const value = m[0];
      const operationInput = m[1] ?? m[0];
      const conf = def.confidence(m);
      if (conf < 0.3) continue;

      const start = m.index;
      const end = start + value.length;
      const existing = results.find(
        (candidate) =>
          candidate.value === value &&
          candidate.start <= end &&
          start <= candidate.end,
      );
      const detection: DetectionResult = {
        label: def.label,
        opName: def.opName,
        defaultArgs: def.defaultArgs,
        confidence: conf,
        inputValue: operationInput,
      };

      if (existing) {
        const duplicateIndex = existing.matches.findIndex(
          (candidate) => candidate.opName === def.opName,
        );
        if (duplicateIndex === -1) {
          existing.matches.push(detection);
        } else if (
          conf > existing.matches[duplicateIndex].confidence
        ) {
          // Prefer the more specific detector (for example Data URI over its
          // generic Base64 payload) when both invoke the same operation.
          existing.matches[duplicateIndex] = detection;
        }
      } else {
        results.push({ start, end, value, matches: [detection] });
      }
    }
  }

  for (const result of results) {
    result.matches.sort((a, b) => b.confidence - a.confidence);
  }
  return results;
}

/**
 * Scans an entire document for known encoded-data patterns and returns all matches
 * with their confidence scores, merging overlapping matches for the same value.
 *
 * @param doc - The VS Code document to scan.
 * @returns Array of detection matches sorted by descending confidence within each group.
 */
export function scanText(doc: vscode.TextDocument): DetectionMatch[] {
  const text = doc.getText();
  return scanString(text).map((span) => ({
    range: new vscode.Range(doc.positionAt(span.start), doc.positionAt(span.end)),
    value: span.value,
    matches: span.matches,
  }));
}
