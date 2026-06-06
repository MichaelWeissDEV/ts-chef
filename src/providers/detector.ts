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
}

interface PatternDef {
  label: string;
  opName: string;
  defaultArgs: unknown[];
  pattern: RegExp;
  confidence: (m: RegExpExecArray) => number;
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

const PATTERNS: PatternDef[] = [
  // ── Base64 (standard) ──────────────────────────────────────────────────
  {
    label: "Base64",
    opName: "FromBase64",
    defaultArgs: ["A-Za-z0-9+/=", true, false],
    pattern: /(?<![A-Za-z0-9+/=])([A-Za-z0-9+/]{20,}={0,2})(?![A-Za-z0-9+/=])/g,
    confidence: (m) => {
      const s = m[1];
      if (s.length % 4 !== 0) return 0.6;
      return Math.min(0.95, 0.7 + entropyScore(s) * 0.3);
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
    confidence: () => 0.82,
  },
  // ── MD5 hash ───────────────────────────────────────────────────────────
  {
    label: "MD5 hash",
    opName: "AnalyseHash",
    defaultArgs: [],
    pattern: /\b([0-9a-fA-F]{32})\b/g,
    confidence: () => 0.82,
  },
  // ── SHA-1 hash ─────────────────────────────────────────────────────────
  {
    label: "SHA-1 hash",
    opName: "AnalyseHash",
    defaultArgs: [],
    pattern: /\b([0-9a-fA-F]{40})\b/g,
    confidence: () => 0.85,
  },
  // ── SHA-256 hash ───────────────────────────────────────────────────────
  {
    label: "SHA-256 hash",
    opName: "AnalyseHash",
    defaultArgs: [],
    pattern: /\b([0-9a-fA-F]{64})\b/g,
    confidence: () => 0.9,
  },
  // ── SHA-512 hash ───────────────────────────────────────────────────────
  {
    label: "SHA-512 hash",
    opName: "AnalyseHash",
    defaultArgs: [],
    pattern: /\b([0-9a-fA-F]{128})\b/g,
    confidence: () => 0.92,
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
    pattern: /([^\s"'`]*(?:%[0-9A-Fa-f]{2}){2,}[^\s"'`]*)/g,
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
    opName: "ParseX509Certificate",
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
    opName: "FromCharCode",
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
    const re = new RegExp(
      def.pattern.source,
      def.pattern.flags.replace("g", ""),
    );
    const m = re.exec(trimmed);
    if (!m) continue;
    const matched = m[1] ?? m[0];
    if (matched.length < trimmed.length * 0.65) continue;
    const conf = def.confidence(m);
    if (conf < 0.3) continue;
    if (!results.some((r) => r.label === def.label)) {
      results.push({
        label: def.label,
        opName: def.opName,
        defaultArgs: def.defaultArgs,
        confidence: conf,
      });
    }
  }
  return results.sort((a, b) => b.confidence - a.confidence);
}

export function scanText(doc: vscode.TextDocument): DetectionMatch[] {
  const text = doc.getText();
  const results: DetectionMatch[] = [];

  for (const def of PATTERNS) {
    const re = new RegExp(def.pattern.source, def.pattern.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const value = m[1] ?? m[0];
      const conf = def.confidence(m);
      if (conf < 0.3) continue;

      const startOffset =
        m.index + (m[0].indexOf(value) >= 0 ? m[0].indexOf(value) : 0);
      const startPos = doc.positionAt(startOffset);
      const endPos = doc.positionAt(startOffset + value.length);
      const range = new vscode.Range(startPos, endPos);

      // Merge into existing match for same value, or add new
      const existing = results.find(
        (r) => r.value === value && r.range.intersection(range) !== undefined,
      );
      if (existing) {
        if (!existing.matches.some((r) => r.opName === def.opName)) {
          existing.matches.push({
            label: def.label,
            opName: def.opName,
            defaultArgs: def.defaultArgs,
            confidence: conf,
          });
        }
      } else {
        results.push({
          range,
          value,
          matches: [
            {
              label: def.label,
              opName: def.opName,
              defaultArgs: def.defaultArgs,
              confidence: conf,
            },
          ],
        });
      }
    }
  }

  for (const r of results) {
    r.matches.sort((a, b) => b.confidence - a.confidence);
  }

  return results;
}
