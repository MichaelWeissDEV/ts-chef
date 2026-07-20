/**
 * @fileoverview Pure shortcut-registry parsing and in-memory action history.
 * @package commands
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import type { PipelineStep } from "../storage/store";

export const SHORTCUT_COMMAND_PREFIX = "tschef.shortcut.";
export const MAX_SHORTCUTS = 1_000;
export const MAX_SHORTCUT_EXPRESSION_LENGTH = 256_000;

export interface OperationHistoryAction {
  kind: "operation";
  label: string;
  opName: string;
  args: unknown[];
}

export interface PipelineHistoryAction {
  kind: "pipeline";
  label: string;
  steps: PipelineStep[];
}

export type HistoryAction = OperationHistoryAction | PipelineHistoryAction;

export type ShortcutTarget =
  | { kind: "expression"; expression: string }
  | { kind: "saved-pipeline"; name: string }
  | { kind: "history-last" }
  | { kind: "history-previous" }
  | { kind: "history-next" }
  | { kind: "history-offset"; offset: number };

export interface ShortcutBinding {
  id: string;
  command: string;
  expression: string;
  target: ShortcutTarget;
}

export interface ShortcutRegistryResult {
  bindings: ShortcutBinding[];
  issues: string[];
}

const SHORTCUT_ID = /^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,63})$/;

/** Parse one registry value into an executable target. */
export function parseShortcutTarget(expression: string): ShortcutTarget {
  const value = expression.trim();
  const history = /^history\s*:\s*(.+)$/i.exec(value);
  if (history) {
    const selector = history[1].trim().toLowerCase();
    if (selector === "last") return { kind: "history-last" };
    if (selector === "previous" || selector === "older") {
      return { kind: "history-previous" };
    }
    if (selector === "next" || selector === "newer") {
      return { kind: "history-next" };
    }
    if (/^[1-9]\d*$/.test(selector)) {
      const offset = Number(selector);
      if (Number.isSafeInteger(offset)) {
        return { kind: "history-offset", offset };
      }
    }
    throw new Error(
      `Unknown history selector "${history[1].trim()}" (use last, previous, next, or a 1-based number)`,
    );
  }

  const saved = /^pipeline\s*:\s*(.+)$/i.exec(value);
  if (saved) {
    const name = saved[1].trim();
    if (!name) throw new Error("Saved pipeline name must not be empty");
    return { kind: "saved-pipeline", name };
  }

  return { kind: "expression", expression: value };
}

/**
 * Validate the free-form `tschef.shortcuts` object without trusting settings
 * data. Invalid entries are ignored individually, so one typo cannot disable
 * the rest of the registry.
 */
export function parseShortcutRegistry(raw: unknown): ShortcutRegistryResult {
  if (raw === undefined || raw === null) return { bindings: [], issues: [] };
  if (typeof raw !== "object" || Array.isArray(raw)) {
    return {
      bindings: [],
      issues: ["tschef.shortcuts must be an object whose values are strings"],
    };
  }

  const bindings: ShortcutBinding[] = [];
  const issues: string[] = [];
  const entries = Object.entries(raw as Record<string, unknown>);
  if (entries.length > MAX_SHORTCUTS) {
    issues.push(`only the first ${MAX_SHORTCUTS} shortcut entries are loaded`);
  }

  for (const [id, configured] of entries.slice(0, MAX_SHORTCUTS)) {
    if (!SHORTCUT_ID.test(id)) {
      issues.push(
        `shortcut id "${id}" is invalid (use 1-64 letters, numbers, dots, underscores, or hyphens)`,
      );
      continue;
    }
    if (typeof configured !== "string" || !configured.trim()) {
      issues.push(`shortcut "${id}" must have a non-empty string value`);
      continue;
    }
    if (configured.length > MAX_SHORTCUT_EXPRESSION_LENGTH) {
      issues.push(`shortcut "${id}" exceeds the expression size limit`);
      continue;
    }
    try {
      bindings.push({
        id,
        command: `${SHORTCUT_COMMAND_PREFIX}${id}`,
        expression: configured.trim(),
        target: parseShortcutTarget(configured),
      });
    } catch (error) {
      issues.push(
        `shortcut "${id}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return { bindings, issues };
}

function copyAction(action: HistoryAction): HistoryAction {
  // History is session-only, but callers still receive detached values so a
  // recipe editor or operation cannot mutate an older history entry.
  try {
    return structuredClone(action);
  } catch {
    if (action.kind === "operation") {
      return { ...action, args: [...action.args] };
    }
    return {
      ...action,
      steps: action.steps.map((step) => ({
        opName: step.opName,
        args: [...step.args],
      })),
    };
  }
}

/**
 * Bounded, session-only registry of executed operations and pipelines.
 * Numeric offsets are 1-based: offset 1 is the newest action.
 */
export class ActionHistory {
  private readonly entries: HistoryAction[] = [];
  private cursorOffset: number | undefined;

  constructor(private readonly capacity = 100) {
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10_000) {
      throw new Error("History capacity must be an integer from 1 to 10000");
    }
  }

  get size(): number {
    return this.entries.length;
  }

  record(action: HistoryAction): void {
    this.entries.unshift(copyAction(action));
    if (this.entries.length > this.capacity)
      this.entries.length = this.capacity;
    // The cursor is anchored on the action that just ran. Therefore
    // `previous()` means the genuinely previous (second-newest) action, while
    // `last()` remains the explicit way to repeat the newest one.
    this.cursorOffset = 1;
  }

  clear(): void {
    this.entries.length = 0;
    this.cursorOffset = undefined;
  }

  all(): HistoryAction[] {
    return this.entries.map(copyAction);
  }

  at(offset: number): HistoryAction | undefined {
    if (!Number.isInteger(offset) || offset < 1) return undefined;
    const action = this.entries[offset - 1];
    return action ? copyAction(action) : undefined;
  }

  last(): HistoryAction | undefined {
    return this.at(1);
  }

  /** Select the next older action, wrapping from oldest back to newest. */
  previous(): HistoryAction | undefined {
    if (this.entries.length === 0) return undefined;
    this.cursorOffset =
      this.cursorOffset === undefined
        ? 1
        : this.cursorOffset >= this.entries.length
          ? 1
          : this.cursorOffset + 1;
    return this.at(this.cursorOffset);
  }

  /** Select the next newer action, wrapping from newest back to oldest. */
  next(): HistoryAction | undefined {
    if (this.entries.length === 0) return undefined;
    this.cursorOffset =
      this.cursorOffset === undefined
        ? 1
        : this.cursorOffset <= 1
          ? this.entries.length
          : this.cursorOffset - 1;
    return this.at(this.cursorOffset);
  }
}

export function describeHistoryAction(action: HistoryAction): string {
  return action.kind === "operation"
    ? action.label
    : `${action.label} (${action.steps.length} step${action.steps.length === 1 ? "" : "s"})`;
}
