import type { PipelineStep } from "../storage/store";
import type { PanelPipelineStep } from "./pipelineProtocol";

let nextStepId = 0;

export function createPanelStepId(): string {
  nextStepId += 1;
  return `step-${Date.now().toString(36)}-${nextStepId.toString(36)}`;
}

function runtimeStepId(step: PipelineStep): string | undefined {
  const id = (step as PipelineStep & { id?: unknown }).id;
  return typeof id === "string" && id.length > 0 && id.length <= 128
    ? id
    : undefined;
}

/** Add stable editor-only IDs to persisted or freshly parsed steps. */
export function toPanelSteps(steps: PipelineStep[]): PanelPipelineStep[] {
  const used = new Set<string>();
  return steps.map((step) => {
    const storedId = runtimeStepId(step);
    const id = storedId && !used.has(storedId) ? storedId : createPanelStepId();
    used.add(id);
    return { id, opName: step.opName, args: [...step.args] };
  });
}

/** Strip webview-only identities before calling the existing runner/store APIs. */
export function toPipelineSteps(steps: PanelPipelineStep[]): PipelineStep[] {
  return steps.map((step) => ({ opName: step.opName, args: [...step.args] }));
}

/**
 * Split pipe syntax at top-level `|` characters. Quotes and nested argument
 * parentheses are respected. This mirrors the runner parser closely enough to
 * determine whether an operation explicitly supplies arguments.
 */
export function splitPipelineParts(raw: string): string[] {
  if (raw.length > 256_000)
    throw new Error("Pipeline text exceeds the 256,000 character limit");
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (const ch of raw) {
    if (escaped) {
      current += ch;
      escaped = false;
      continue;
    }
    if (ch === "\\" && quote) {
      current += ch;
      escaped = true;
      continue;
    }
    if (quote) {
      current += ch;
      if (ch === quote) quote = "";
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === "(") depth += 1;
    else if (ch === ")") {
      if (depth === 0)
        throw new Error("Pipeline syntax has an unmatched closing parenthesis");
      depth -= 1;
    }
    if (ch === "|" && depth === 0) {
      if (!current.trim())
        throw new Error("Pipeline syntax contains an empty step");
      parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (quote) throw new Error("Pipeline syntax has an unterminated quote");
  if (depth !== 0)
    throw new Error("Pipeline syntax has an unmatched opening parenthesis");
  if (current.trim()) parts.push(current.trim());
  else if (parts.length > 0)
    throw new Error("Pipeline syntax contains a trailing empty step");
  return parts;
}

/**
 * Give host-parsed steps identities and retain existing argument values for
 * operations that the user wrote without an explicit `(arg=value)` section.
 * Thus editing order/names in pipe syntax cannot silently reset configured UI
 * arguments to operation defaults.
 */
export function mergeParsedPanelSteps(
  raw: string,
  parsed: PipelineStep[],
  previous: PanelPipelineStep[],
): PanelPipelineStep[] {
  const parts = splitPipelineParts(raw);
  const consumed = new Set<number>();
  return parsed.map((step, index) => {
    const encodedArgs = decodePanelArgs(parts[index] ?? "");
    const explicitArgs = parts[index]?.includes("(") ?? false;
    let previousIndex = previous[index]?.opName === step.opName ? index : -1;
    if (previousIndex < 0) {
      previousIndex = previous.findIndex(
        (candidate, candidateIndex) =>
          !consumed.has(candidateIndex) && candidate.opName === step.opName,
      );
    }
    if (previousIndex >= 0) consumed.add(previousIndex);
    const old = previousIndex >= 0 ? previous[previousIndex] : undefined;
    return {
      id: old?.id ?? createPanelStepId(),
      opName: step.opName,
      args:
        encodedArgs ?? (explicitArgs || !old ? [...step.args] : [...old.args]),
    };
  });
}

const PANEL_ARGS_KEY = "__tschef_args";

/**
 * Encode every argument in a token that cannot affect the legacy pipeline
 * parser's parenthesis/pipe scanning. Base64url deliberately excludes `()|`.
 */
export function encodePanelArgs(args: unknown[]): string {
  return Buffer.from(JSON.stringify(args), "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function decodePanelArgs(part: string): unknown[] | undefined {
  const pattern = new RegExp(`${PANEL_ARGS_KEY}\\s*=\\s*([A-Za-z0-9_-]+)`);
  const match = pattern.exec(part);
  if (!match) return undefined;
  try {
    const token = match[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = token + "=".repeat((4 - (token.length % 4)) % 4);
    const value = JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
    return Array.isArray(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Canonical panel syntax. The existing host parser validates operation names;
 * ignored, parser-safe metadata restores argument types that its legacy caster
 * cannot express, such as toggleString objects and array-valued options.
 */
export function serialisePanelPipeline(
  steps: PanelPipelineStep[],
  displayNameFor: (opName: string) => string,
): string {
  return steps
    .map((step) => {
      const name = displayNameFor(step.opName);
      return step.args.length
        ? `${name}(${PANEL_ARGS_KEY}=${encodePanelArgs(step.args)})`
        : name;
    })
    .join(" | ");
}

export function pipelineSummary(
  steps: PanelPipelineStep[],
  displayNameFor: (opName: string) => string,
): string {
  return steps.map((step) => displayNameFor(step.opName)).join(" | ");
}
