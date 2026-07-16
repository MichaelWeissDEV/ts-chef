/**
 * Instant, on-demand analysis hovers for encoded strings and integer literals.
 */

import * as vscode from "vscode";
import { createHash } from "crypto";
import { ScanState } from "./scanState";
import {
  analyseValue,
  scanString,
  type DetectionMatch,
} from "./detector";
import { presentBytes, runOpAsync } from "../commands/runner";
import { findOp } from "../opsRegistry";
import { magicAnalyse, stringStats } from "./magic";
import {
  findIntegerLiteralAt,
  formatIntegerLiteral,
  type IntegerFormat,
  type IntegerLiteralAnalysis,
} from "./integerLiteral";

export interface HoverTextTarget {
  uri: string;
  version: number;
  start: { line: number; character: number };
  end: { line: number; character: number };
  sha256: string;
}

export interface HoverOperationPayload {
  target: HoverTextTarget;
  opName: string;
  args: unknown[];
  input?: { start: number; end: number };
}

export interface HoverPipelinePayload {
  target: HoverTextTarget;
  steps: Array<{ opName: string; args: unknown[] }>;
  input?: { start: number; end: number };
}

export interface HoverReplacementPayload {
  target: HoverTextTarget;
  replacement: string;
}

const ENABLED_COMMANDS = [
  "tschef.applyConversion",
  "tschef.applyPipelineConversion",
  "tschef.replaceIntegerLiteral",
];
const MAX_HOVER_TARGET_CHARACTERS = 1024 * 1024;

function hashText(value: string): string {
  return createHash("sha256").update(value, "utf-8").digest("hex");
}

function commandLink(command: string, payload: unknown, label: string): string {
  return `[${label}](command:${command}?${encodeURIComponent(JSON.stringify(payload))})`;
}

function targetFor(
  doc: vscode.TextDocument,
  range: vscode.Range,
  value: string,
): HoverTextTarget {
  return {
    uri: doc.uri.toString(),
    version: doc.version,
    start: { line: range.start.line, character: range.start.character },
    end: { line: range.end.line, character: range.end.character },
    sha256: hashText(value),
  };
}

function inputRange(
  fullValue: string,
  operationInput: string | undefined,
): { start: number; end: number } | undefined {
  if (!operationInput || operationInput === fullValue) return undefined;
  const start = fullValue.indexOf(operationInput);
  return start >= 0 ? { start, end: start + operationInput.length } : undefined;
}

function confidence(match: DetectionMatch): number {
  return match.matches.reduce((best, item) => Math.max(best, item.confidence), 0);
}

function selectMatch(
  matches: DetectionMatch[],
  position: vscode.Position,
): DetectionMatch | undefined {
  return matches
    .filter((match) => match.range.contains(position))
    .sort((a, b) => confidence(b) - confidence(a))[0];
}

function onDemandMatch(
  doc: vscode.TextDocument,
  position: vscode.Position,
  maxInput: number,
): DetectionMatch | undefined {
  const line = doc.lineAt(position.line).text;
  const coreStart =
    line.length > maxInput
      ? Math.max(0, position.character - Math.floor(maxInput / 2))
      : 0;
  const coreEnd = Math.min(line.length, coreStart + maxInput);
  // Include delimiter context so a token ending exactly at the analysis window
  // is distinguishable from a token that was cropped by the window.
  const windowStart = Math.max(0, coreStart - 1);
  const windowEnd = Math.min(line.length, coreEnd + 1);
  const source = line.slice(windowStart, windowEnd);
  const cursor = position.character - windowStart;
  const spans = scanString(source)
    .filter((span) => cursor >= span.start && cursor <= span.end)
    .map<DetectionMatch | undefined>((span) => {
      const croppedLeft = windowStart > 0 && span.start === 0;
      const croppedRight = windowEnd < line.length && span.end === source.length;
      if (croppedLeft || croppedRight) {
        const base64Like = span.matches.some((candidate) =>
          ["Base64", "Base64url", "Hex string"].includes(candidate.label),
        );
        if (!base64Like) return undefined;

        let start = position.character;
        let end = position.character;
        const allowedLeft = /[A-Za-z0-9+/_-]/;
        const allowedRight = /[A-Za-z0-9+/=_-]/;
        while (start > 0 && allowedLeft.test(line[start - 1])) {
          start--;
          if (end - start > MAX_HOVER_TARGET_CHARACTERS) return undefined;
        }
        while (end < line.length && allowedRight.test(line[end])) {
          end++;
          if (end - start > MAX_HOVER_TARGET_CHARACTERS) return undefined;
        }

        // Recover a short data-URI prefix when the bounded scan covered only
        // the long Base64 payload.
        const prefixStart = Math.max(0, start - 160);
        const prefix = line.slice(prefixStart, start);
        const dataPrefix = /data:[a-z0-9.+/-]+;base64,$/i.exec(prefix);
        if (dataPrefix) start = prefixStart + dataPrefix.index;

        const value = line.slice(start, end);
        const matches = analyseValue(value);
        if (!matches.length) return undefined;
        return {
          range: new vscode.Range(position.line, start, position.line, end),
          value,
          matches,
        };
      }
      return {
        range: new vscode.Range(
          position.line,
          windowStart + span.start,
          position.line,
          windowStart + span.end,
        ),
        value: span.value,
        matches: span.matches,
      };
    })
    .filter((match): match is DetectionMatch => match !== undefined);
  return selectMatch(spans, position);
}

function bytesFrom(value: unknown, outputType?: string): Buffer | undefined {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof ArrayBuffer) return Buffer.from(new Uint8Array(value));
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (
    outputType?.toLowerCase().replace(/[^a-z]/g, "") === "bytearray" &&
    Array.isArray(value) &&
    value.every(
      (item) => Number.isInteger(item) && Number(item) >= 0 && Number(item) <= 255,
    )
  )
    return Buffer.from(value as number[]);
  return undefined;
}

function displayValue(value: unknown, outputType?: string): string {
  const bytes = bytesFrom(value, outputType);
  if (bytes) {
    const presented = presentBytes(bytes);
    if (presented !== bytes.toString("hex")) return presented;
    return `Binary (${bytes.length} bytes)\nhex: ${presented}`;
  }
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function safePreview(
  value: unknown,
  maxLength: number,
  outputType?: string,
): string {
  const raw = Array.from(displayValue(value, outputType), (character) => {
    const code = character.charCodeAt(0);
    return (code >= 0 && code <= 8) ||
      code === 11 ||
      code === 12 ||
      (code >= 14 && code <= 31) ||
      code === 127
      ? `\\x${code.toString(16).padStart(2, "0")}`
      : character;
  }).join("");
  if (raw.length <= maxLength) return raw || "(empty result)";
  const tailLength = Math.min(48, Math.floor(maxLength / 4));
  return `${raw.slice(0, maxLength - tailLength - 1)}…${raw.slice(-tailLength)}`;
}

function previewLanguage(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  )
    return "json";
  return "text";
}

function unionRange(a: vscode.Range | undefined, b: vscode.Range): vscode.Range {
  if (!a) return b;
  const start = a.start.isBefore(b.start) ? a.start : b.start;
  const end = a.end.isAfter(b.end) ? a.end : b.end;
  return new vscode.Range(start, end);
}

function appendNumberHover(
  md: vscode.MarkdownString,
  doc: vscode.TextDocument,
  range: vscode.Range,
  analysis: IntegerLiteralAnalysis,
): void {
  md.appendMarkdown("### ts-chef · Instant integer calculator\n\n");
  md.appendMarkdown(
    `Detected **base ${analysis.radix}** integer · inferred **${analysis.bitWidth}-bit** width\n\n`,
  );
  md.appendMarkdown("| Format | Value |\n|---|---|\n");
  md.appendMarkdown(`| Decimal | \`${analysis.decimal}\` |\n`);
  md.appendMarkdown(`| Hex | \`${analysis.hex}\` |\n`);
  md.appendMarkdown(`| Binary | \`${analysis.binary}\` |\n`);
  md.appendMarkdown(`| Octal | \`${analysis.octal}\` |\n\n`);
  md.appendMarkdown(
    `**Two's complement (${analysis.bitWidth}-bit):** ` +
      `\`${analysis.twosComplementHex}\` · ` +
      `\`${analysis.twosComplementBinary}\`\n\n`,
  );
  md.appendMarkdown(
    `Unsigned bits: \`${analysis.unsignedAtWidth}\` · signed interpretation: ` +
      `\`${analysis.signedAtWidth}\`\n\n`,
  );
  if (analysis.warning) {
    md.appendMarkdown(
      `$(warning) **${analysis.warning}.** Values below are wrapped for display.\n\n`,
    );
  }

  const target = targetFor(doc, range, analysis.raw);
  const formats: Array<[IntegerFormat, string]> = [
    ["hex", "Hex"],
    ["decimal", "Dec"],
    ["binary", "Bin"],
    ["octal", "Oct"],
  ];
  md.appendMarkdown(
    formats
      .map(([format, label]) =>
        commandLink(
          "tschef.replaceIntegerLiteral",
          {
            target,
            replacement: formatIntegerLiteral(analysis, format, doc.languageId),
          } satisfies HoverReplacementPayload,
          `Replace with ${label}`,
        ),
      )
      .join(" · "),
  );
  md.appendMarkdown("\n\n");
}

/** Hover provider that analyses the value under the cursor without a prior scan. */
export class HoverProvider implements vscode.HoverProvider {
  constructor(private readonly state: ScanState) {}

  async provideHover(
    doc: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
  ): Promise<vscode.Hover | undefined> {
    const config = vscode.workspace.getConfiguration("tschef");
    if (!config.get("hover.enabled", true)) return undefined;
    const threshold = config.get("confidenceThreshold", 0.65);
    const maxInput = Math.max(
      256,
      config.get("hover.maxInputCharacters", 65_536),
    );
    const maxPreview = Math.max(
      80,
      config.get("hover.maxPreviewCharacters", 320),
    );

    const line = doc.lineAt(position.line).text;
    // A generated/minified file can contain a multi-megabyte logical line.
    // Integer literals are capped at 4096 chars, so a bounded cursor window is
    // sufficient and avoids rescanning the entire line for every mouse move.
    const numberWindowSize = Math.max(8_192, Math.min(maxInput, 16_384));
    const numberWindowStart =
      line.length > numberWindowSize
        ? Math.max(0, position.character - Math.floor(numberWindowSize / 2))
        : 0;
    const numberSource = line.slice(
      numberWindowStart,
      numberWindowStart + numberWindowSize,
    );
    const locatedNumber = config.get("hover.integerCalculator", true)
      ? findIntegerLiteralAt(
          numberSource,
          position.character - numberWindowStart,
          doc.languageId,
        )
      : undefined;
    const number = locatedNumber
      ? {
          ...locatedNumber,
          start: locatedNumber.start + numberWindowStart,
          end: locatedNumber.end + numberWindowStart,
        }
      : undefined;
    const numberRange = number
      ? new vscode.Range(position.line, number.start, position.line, number.end)
      : undefined;

    let match = selectMatch(this.state.get(doc.uri), position);
    if (match && doc.getText(match.range) !== match.value) match = undefined;
    match ??= config.get("hover.onDemand", true)
      ? onDemandMatch(doc, position, maxInput)
      : undefined;

    const detections = (match?.matches ?? [])
      .filter((item) => item.confidence >= threshold)
      .slice(0, 4);
    if (!number && (!match || detections.length === 0)) return undefined;

    const md = new vscode.MarkdownString("", true);
    md.isTrusted = { enabledCommands: ENABLED_COMMANDS };
    md.supportHtml = false;
    let hoverRange: vscode.Range | undefined;

    if (number && numberRange) {
      appendNumberHover(md, doc, numberRange, number.analysis);
      hoverRange = unionRange(hoverRange, numberRange);
    }

    if (match && detections.length > 0 && !token.isCancellationRequested) {
      hoverRange = unionRange(hoverRange, match.range);
      const stats = stringStats(match.value);
      md.appendMarkdown("### ts-chef · String analysis\n\n");
      md.appendMarkdown(
        `${stats.length} chars · entropy ${stats.entropy} bits/char · ${stats.charset}\n\n`,
      );
      const target = targetFor(doc, match.range, match.value);

      for (const detection of detections) {
        if (token.isCancellationRequested) break;
        const certainty = Math.round(detection.confidence * 100);
        md.appendMarkdown(`**${detection.label}** · ${certainty}%\n\n`);
        try {
          const operationInput = detection.inputValue ?? match.value;
          const result = await runOpAsync(
            detection.opName,
            operationInput.slice(0, maxInput),
            detection.defaultArgs,
          );
          const outputType = findOp(detection.opName)?.factory().outputType;
          const preview = safePreview(result, maxPreview, outputType);
          md.appendCodeblock(preview, previewLanguage(preview));
          md.appendMarkdown(
            commandLink(
              "tschef.applyConversion",
              {
                target,
                opName: detection.opName,
                args: detection.defaultArgs,
                input: inputRange(match.value, operationInput),
              } satisfies HoverOperationPayload,
              "Decode here",
            ),
          );
          md.appendMarkdown("\n\n");
        } catch (error) {
          md.appendCodeblock(
            `Preview failed: ${safePreview(String(error), 160)}`,
            "text",
          );
        }
      }

      if (
        config.get("hover.decodeChains", true) &&
        match.value.length <= Math.min(maxInput, 32_768) &&
        !token.isCancellationRequested
      ) {
        const chains = magicAnalyse(match.value, 3, {
          allowDecompression: false,
          maxIntermediateBytes: Math.min(maxInput, 64 * 1024),
        })
          .filter((chain) => chain.steps.length > 1)
          .slice(0, 2);
        if (chains.length) md.appendMarkdown("**Multi-step decode paths**\n\n");
        for (const chain of chains) {
          const title = chain.steps.map((step) => step.label).join(" → ");
          md.appendMarkdown(`*${title}*\n\n`);
          md.appendCodeblock(safePreview(chain.preview, maxPreview), "text");
          md.appendMarkdown(
            commandLink(
              "tschef.applyPipelineConversion",
              {
                target,
                steps: chain.steps.map((step) => ({
                  opName: step.opName,
                  args: step.args,
                })),
                input: inputRange(match.value, chain.input),
              } satisfies HoverPipelinePayload,
              "Apply decode chain",
            ),
          );
          md.appendMarkdown("\n\n");
        }
      }
    }

    return hoverRange ? new vscode.Hover(md, hoverRange) : undefined;
  }
}
