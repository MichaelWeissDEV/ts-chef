/**
 * @fileoverview magic provider — recursive auto-decoding of unknown strings
 * @package providers
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { analyseValue, type DetectionResult } from "./detector";
import { readableUtf8, runOp } from "../commands/runner";
import type { AnyInput } from "../chef/Operation";
import { gunzipSync, inflateSync } from "zlib";

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
  /** Captured inner value when the recognisable payload is wrapped (e.g. data URI). */
  input?: string;
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
const DEFAULT_MAX_INTERMEDIATE_BYTES = 256 * 1024;

/**
 * Explicit Magic analysis is allowed to recognise short, complete Base64
 * values.  The document-wide detector deliberately starts at 20 characters to
 * avoid decorating ordinary identifiers; that trade-off is too conservative
 * once the user has explicitly asked Magic to analyse a complete value.
 */
function shortBase64Candidate(value: string): DetectionResult[] {
  const compact = value.trim();
  if (
    compact.length < 8 ||
    compact.length >= 20 ||
    compact.length % 4 !== 0 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      compact,
    )
  )
    return [];

  const decoded = Buffer.from(compact, "base64");
  if (!decoded.length || decoded.toString("base64") !== compact) return [];

  return [
    {
      label: "Base64",
      opName: "FromBase64",
      defaultArgs: ["A-Za-z0-9+/=", true, false],
      confidence: 0.82,
      inputValue: compact,
    },
  ];
}

export interface MagicAnalysisOptions {
  /** Hard cap for the input and every decoded/decompressed intermediate. */
  maxIntermediateBytes?: number;
  /** Disable even bounded decompression, useful for latency-sensitive hovers. */
  allowDecompression?: boolean;
}

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

function knownByteLength(value: unknown): number | undefined {
  if (typeof value === "string") return Buffer.byteLength(value, "utf-8");
  if (Buffer.isBuffer(value) || value instanceof Uint8Array)
    return value.byteLength;
  if (value instanceof ArrayBuffer) return value.byteLength;
  if (Array.isArray(value)) return value.length;
  return undefined;
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
): DetectionResult[] {
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
export function magicAnalyse(
  value: string,
  maxDepth = MAX_DEPTH,
  options: MagicAnalysisOptions = {},
): MagicChain[] {
  const chains: MagicChain[] = [];
  const seenPaths = new Set<string>();
  const maxIntermediateBytes = Math.max(
    1_024,
    Math.min(
      options.maxIntermediateBytes ?? DEFAULT_MAX_INTERMEDIATE_BYTES,
      4 * 1024 * 1024,
    ),
  );
  const allowDecompression = options.allowDecompression ?? true;

  function runCandidate(
    candidate: DetectionResult,
    input: AnyInput,
  ): AnyInput | undefined {
    const knownLength = knownByteLength(input);
    if (knownLength !== undefined && knownLength > maxIntermediateBytes)
      return undefined;
    const bytes = toBytes(input);
    if (bytes.length > maxIntermediateBytes) return undefined;
    try {
      // Node's bounded zlib helpers abort once maxOutputLength is reached. Do
      // not call the general operations here: their underlying libraries
      // allocate the complete expansion first, which makes hover-triggered
      // compression bombs possible.
      if (candidate.opName === "Gunzip") {
        if (!allowDecompression) return undefined;
        return gunzipSync(bytes, { maxOutputLength: maxIntermediateBytes });
      }
      if (candidate.opName === "ZlibInflate") {
        if (!allowDecompression) return undefined;
        return inflateSync(bytes, { maxOutputLength: maxIntermediateBytes });
      }
      // lz4js exposes no bounded-output API, so recursive analysis only
      // identifies LZ4 data; explicit user-run pipelines can still process it.
      if (candidate.opName === "LZ4Decompress") return undefined;
      return runOp(
        candidate.opName,
        input,
        candidate.defaultArgs as unknown[],
      );
    } catch {
      return undefined;
    }
  }

  function walk(
    current: AnyInput,
    steps: MagicStep[],
    confidence: number,
    depthLeft: number,
    chainInput?: string,
  ): void {
    if (depthLeft <= 0 || chains.length >= MAX_CHAINS) return;
    const knownLength = knownByteLength(current);
    if (knownLength !== undefined && knownLength > maxIntermediateBytes) return;
    const bytes = toBytes(current);
    if (!bytes.length || bytes.length > maxIntermediateBytes) return;

    const decodedText = readableUtf8(bytes);
    const candidates = [
      ...(decodedText !== undefined
        ? [...analyseValue(decodedText), ...shortBase64Candidate(decodedText)]
        : []),
      ...sniffBinary(bytes),
    ].slice(0, MAX_CANDIDATES_PER_LEVEL);

    for (const cand of candidates) {
      const operationInput = cand.inputValue ?? current;
      const nextInput =
        chainInput ??
        (steps.length === 0 && typeof operationInput === "string"
          ? operationInput
          : undefined);
      const out = runCandidate(cand, operationInput);
      if (out === undefined) continue;
      const outBytes = toBytes(out);
      if (
        !outBytes.length ||
        outBytes.length > maxIntermediateBytes ||
        outBytes.equals(bytes)
      )
        continue;

      const nextSteps = [
        ...steps,
        { label: cand.label, opName: cand.opName, args: cand.defaultArgs as unknown[] },
      ];
      const nextConfidence = confidence * cand.confidence;
      const pathKey = nextSteps.map((s) => s.opName).join(">");

      const preview = readableUtf8(outBytes);
      if (preview !== undefined && !seenPaths.has(pathKey)) {
        seenPaths.add(pathKey);
        chains.push({
          steps: nextSteps,
          preview: preview.slice(0, 200),
          confidence: nextConfidence,
          input: nextInput,
        });
      }

      if (!NO_RECURSE.has(cand.opName)) {
        walk(out, nextSteps, nextConfidence, depthLeft - 1, nextInput);
      }
    }
  }

  walk(value, [], 1, maxDepth);

  return chains.sort(
    (a, b) =>
      b.steps.length - a.steps.length || b.confidence - a.confidence,
  );
}
