/**
 * @fileoverview Bounded adapter for the shared ts-chef Magic analyser
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import { magicAnalyse, shannonEntropy } from "../../providers/magic";

/** Maximum textual input and decoded intermediate accepted by the operation. */
export const MAGIC_MAX_INTERMEDIATE_BYTES = 256 * 1024;

/** Maximum literal crib length. Matching is deliberately not regex-based. */
export const MAGIC_MAX_CRIB_CHARACTERS = 128;

export interface MagicResult {
  recipe: Array<{ op: string; args: unknown[] }>;
  /** Bounded decoded preview (at most 200 characters). */
  data: string;
  type: "string";
  valid: true;
  score: number;
  confidence: number;
  labels: string[];
  isUTF8: true;
  languageScores: Array<{ lang: string; score: number }>;
  fileType: null;
  entropy: number;
  matchingOps: Array<{ op: string }>;
  useful: true;
  /** Captured payload when the recognised value was wrapped, e.g. a data URI. */
  input?: string;
}

export interface MagicOptions {
  /** May lower, but never raise, the operation's hard intermediate-size cap. */
  maxIntermediateBytes?: number;
}

function clampDepth(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return 3;
  return Math.max(1, Math.min(3, Math.floor(parsed)));
}

function validateCrib(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value !== "string")
    throw new TypeError("Magic crib must be a string.");
  if (value.length > MAGIC_MAX_CRIB_CHARACTERS) {
    throw new RangeError(
      `Magic crib is limited to ${MAGIC_MAX_CRIB_CHARACTERS} characters.`,
    );
  }
  return value;
}

function toText(value: string | Uint8Array): string {
  if (typeof value === "string") return value;
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(value);
  } catch (error) {
    throw new TypeError("Magic requires UTF-8 textual input.", { cause: error });
  }
}

/**
 * Compatibility facade for the former CyberChef Magic port. The old facade
 * returned an empty array unconditionally; this implementation delegates to
 * the same bounded decoder used by hover/deep analysis.
 */
class Magic {
  private readonly maxIntermediateBytes: number;

  constructor(
    private readonly data: string | Uint8Array,
    options: MagicOptions = {},
  ) {
    const requested = Number(options.maxIntermediateBytes);
    this.maxIntermediateBytes = Number.isFinite(requested)
      ? Math.max(
          1_024,
          Math.min(MAGIC_MAX_INTERMEDIATE_BYTES, Math.floor(requested)),
        )
      : MAGIC_MAX_INTERMEDIATE_BYTES;
  }

  isUTF8(): boolean {
    try {
      toText(this.data);
      return true;
    } catch {
      return false;
    }
  }

  static codeToLanguage(code: string): string {
    const languages: Record<string, string> = {
      en: "English",
      de: "German",
      fr: "French",
      es: "Spanish",
      it: "Italian",
      pt: "Portuguese",
      nl: "Dutch",
      ru: "Russian",
      zh: "Chinese",
      ja: "Japanese",
      ko: "Korean",
      ar: "Arabic",
    };
    return languages[code] ?? code;
  }

  async speculativeExecution(
    depth: number,
    _extLang: boolean,
    crib: string,
    _previousRecipe: unknown[],
    _intensive: boolean,
    _cribRegex: RegExp | null,
  ): Promise<MagicResult[]> {
    const text = toText(this.data);
    const inputBytes = Buffer.byteLength(text, "utf-8");
    if (inputBytes > this.maxIntermediateBytes) {
      throw new RangeError(
        `Magic input exceeds the ${this.maxIntermediateBytes.toLocaleString()}-byte safety limit.`,
      );
    }

    // The shared analyser bounds candidate count, decompression output and
    // preview length in addition to the operation-level input/depth limits.
    const literalCrib = validateCrib(crib);
    const needle = literalCrib.toLowerCase();
    const chains = magicAnalyse(text, clampDepth(depth), {
      maxIntermediateBytes: this.maxIntermediateBytes,
      allowDecompression: true,
    });

    return chains
      .filter(
        (chain) => !needle || chain.preview.toLowerCase().includes(needle),
      )
      .map((chain) => ({
        recipe: chain.steps.map((step) => ({
          op: step.opName,
          args: [...step.args],
        })),
        data: chain.preview,
        type: "string" as const,
        valid: true as const,
        score: chain.confidence,
        confidence: chain.confidence,
        labels: chain.steps.map((step) => step.label),
        isUTF8: true as const,
        languageScores: [],
        fileType: null,
        entropy:
          Math.round(shannonEntropy(chain.preview) * 100) / 100,
        matchingOps: chain.steps.map((step) => ({ op: step.opName })),
        useful: true as const,
        ...(chain.input === undefined ? {} : { input: chain.input }),
      }));
  }
}

export default Magic;
