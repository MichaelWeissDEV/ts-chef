/**
 * @fileoverview magic provider — recursive auto-decoding of unknown strings
 * @package providers
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { analyseValue } from "./detector";
import { runOp } from "../commands/runner";
import type { AnyInput } from "../chef/Operation";

/** One operation applied within a decode chain. */
export interface MagicStep {
  label: string;
  opName: string;
  args: unknown[];
}

/** A candidate decode path with its final (printable) result preview. */
export interface MagicChain {
  steps: MagicStep[];
  /** First 200 chars of the decoded result. */
  preview: string;
  /** Product of the per-step detection confidences. */
  confidence: number;
}

/** Basic statistics about a string, shown in the deep-analysis picker. */
export interface StringStats {
  length: number;
  /** Shannon entropy in bits per character. */
  entropy: number;
  /** Rough classification of the character set. */
  charset: string;
}

/** Analysis-only operations: useful as a terminal step, pointless to recurse into. */
const NO_RECURSE = new Set(["AnalyseHash", "AnalyseUUID", "PubKeyFromCert"]);

const MAX_DEPTH = 3;
const MAX_CANDIDATES_PER_LEVEL = 4;
const MAX_CHAINS = 24;

/** Shannon entropy of a string in bits per character. */
export function shannonEntropy(s: string): number {
  if (!s.length) return 0;
  const freq = new Map<string, number>();
  for (const c of s) freq.set(c, (freq.get(c) ?? 0) + 1);
  let e = 0;
  for (const cnt of freq.values()) {
    const p = cnt / s.length;
    e -= p * Math.log2(p);
  }
  return e;
}

/** Rough charset classification used in the stats line. */
function classifyCharset(s: string): string {
  if (/^[01\s]+$/.test(s)) return "binary digits";
  if (/^[0-9a-fA-F\s:,-]+$/.test(s)) return "hex";
  if (/^[A-Z2-7=\s]+$/.test(s)) return "base32";
  if (/^[A-Za-z0-9+/=\s]+$/.test(s)) return "base64";
  if (/^[A-Za-z0-9\-_.\s]+$/.test(s)) return "base64url / token";
  if (/^[\x20-\x7e\s]+$/.test(s)) return "printable ASCII";
  return "mixed / binary";
}

/** Length, entropy and charset guess for the analysed value. */
export function stringStats(value: string): StringStats {
  return {
    length: value.length,
    entropy: Math.round(shannonEntropy(value) * 100) / 100,
    charset: classifyCharset(value),
  };
}

function toBytes(v: unknown): Buffer {
  if (Buffer.isBuffer(v)) return v;
  if (typeof v === "string") return Buffer.from(v, "utf-8");
  if (Array.isArray(v)) return Buffer.from(v as number[]);
  if (v instanceof ArrayBuffer) return Buffer.from(new Uint8Array(v));
  if (v instanceof Uint8Array) return Buffer.from(v);
  return Buffer.from(String(v ?? ""), "utf-8");
}

/** Ratio of bytes that are printable ASCII or common whitespace. */
export function printableRatio(bytes: Buffer): number {
  if (!bytes.length) return 0;
  let ok = 0;
  for (const b of bytes) {
    if ((b >= 0x20 && b <= 0x7e) || b === 0x09 || b === 0x0a || b === 0x0d)
      ok++;
  }
  return ok / bytes.length;
}

/**
 * Sniff well-known binary magic bytes so chains can continue through
 * compressed data (e.g. Base64 → Gunzip), which text detectors cannot see.
 */
function sniffBinary(
  bytes: Buffer,
): { label: string; opName: string; defaultArgs: unknown[]; confidence: number }[] {
  const out: ReturnType<typeof sniffBinary> = [];
  if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b)
    out.push({ label: "Gzip", opName: "Gunzip", defaultArgs: [], confidence: 0.96 });
  if (
    bytes.length >= 2 &&
    bytes[0] === 0x78 &&
    (bytes[1] === 0x01 || bytes[1] === 0x9c || bytes[1] === 0xda)
  )
    out.push({
      label: "Zlib",
      opName: "ZlibInflate",
      defaultArgs: [],
      confidence: 0.9,
    });
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x04 &&
    bytes[1] === 0x22 &&
    bytes[2] === 0x4d &&
    bytes[3] === 0x18
  )
    out.push({
      label: "LZ4",
      opName: "LZ4Decompress",
      defaultArgs: [],
      confidence: 0.95,
    });
  return out;
}

/**
 * Recursively try to decode `value`, following the detector's candidates (and
 * binary magic-byte sniffing after each step) up to {@link MAX_DEPTH} levels.
 * Only chains whose final output is mostly printable are returned, deepest and
 * most confident first — the CyberChef "Magic" idea, scoped to ts-chef's ops.
 */
export function magicAnalyse(value: string, maxDepth = MAX_DEPTH): MagicChain[] {
  const chains: MagicChain[] = [];
  const seenPaths = new Set<string>();

  function walk(
    current: AnyInput,
    steps: MagicStep[],
    confidence: number,
    depthLeft: number,
  ): void {
    if (depthLeft <= 0 || chains.length >= MAX_CHAINS) return;
    const bytes = toBytes(current);
    if (!bytes.length) return;

    const textual = printableRatio(bytes) >= 0.9;
    const candidates = [
      ...(textual ? analyseValue(bytes.toString("utf-8")) : []),
      ...sniffBinary(bytes),
    ].slice(0, MAX_CANDIDATES_PER_LEVEL);

    for (const cand of candidates) {
      let out: AnyInput;
      try {
        out = runOp(cand.opName, current, cand.defaultArgs as unknown[]);
      } catch {
        continue;
      }
      const outBytes = toBytes(out);
      if (!outBytes.length || outBytes.equals(bytes)) continue;

      const nextSteps = [
        ...steps,
        { label: cand.label, opName: cand.opName, args: cand.defaultArgs as unknown[] },
      ];
      const nextConfidence = confidence * cand.confidence;
      const pathKey = nextSteps.map((s) => s.opName).join(">");

      if (printableRatio(outBytes) >= 0.85 && !seenPaths.has(pathKey)) {
        seenPaths.add(pathKey);
        chains.push({
          steps: nextSteps,
          preview: outBytes.toString("utf-8").slice(0, 200),
          confidence: nextConfidence,
        });
      }

      if (!NO_RECURSE.has(cand.opName)) {
        walk(out, nextSteps, nextConfidence, depthLeft - 1);
      }
    }
  }

  walk(value, [], 1, maxDepth);

  return chains.sort(
    (a, b) =>
      b.steps.length - a.steps.length || b.confidence - a.confidence,
  );
}
