/**
 * @fileoverview store storage manager for persistent data
 * @package storage
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { randomBytes } from "crypto";

const MAX_STORE_FILE_BYTES = 8 * 1024 * 1024;
const MAX_STORE_ENTRIES = 2_000;
const warnedStoreProblems = new Set<string>();

function warnStoreProblem(file: string, detail: string): void {
  const key = `${file}:${detail}`;
  if (warnedStoreProblems.has(key)) return;
  warnedStoreProblems.add(key);
  void vscode.window.showWarningMessage(
    `ts-chef: ignored invalid data in ${path.basename(file)} (${detail}).`,
  );
}

type DirectoryState = "missing" | "safe" | "unsafe";

/** Inspect the path itself rather than following a repository-controlled link. */
function directoryState(dir: string): DirectoryState {
  try {
    const stat = fs.lstatSync(dir);
    if (stat.isSymbolicLink() || !stat.isDirectory()) {
      warnStoreProblem(dir, "storage path is not a regular directory");
      return "unsafe";
    }
    return "safe";
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return "missing";
    warnStoreProblem(dir, "storage path is unreadable");
    return "unsafe";
  }
}

/**
 * Where a preset lives:
 * - `workspace` — `<ws>/.vscode/ts-chef/` (or `<ws>/.ts-chef/`), per-project.
 * - `global`    — `context.globalStorageUri`, shared across all workspaces.
 */
export type StorageScope = "workspace" | "global";

function workspaceStoreDir(): string | undefined {
  const ws = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!ws) return undefined;
  const vscodePath = path.join(ws, ".vscode");
  const vscodeState = directoryState(vscodePath);
  if (vscodeState === "unsafe") return undefined;

  const dir =
    vscodeState === "safe"
      ? path.join(vscodePath, "ts-chef")
      : path.join(ws, ".ts-chef");
  return directoryState(dir) === "unsafe" ? undefined : dir;
}

function ensureDir(dir: string): void {
  const before = directoryState(dir);
  if (before === "unsafe") throw new Error("Unsafe storage directory");
  if (before === "missing") fs.mkdirSync(dir, { recursive: true });
  if (directoryState(dir) !== "safe") {
    throw new Error("Unable to create a safe storage directory");
  }
}

function readValidatedArray<T>(
  file: string,
  validate: (value: unknown) => T | undefined,
): T[] {
  try {
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink() || !stat.isFile()) {
      warnStoreProblem(file, "not a regular file");
      return [];
    }
    if (stat.size > MAX_STORE_FILE_BYTES) {
      warnStoreProblem(file, "file exceeds the 8 MiB safety limit");
      return [];
    }
    const parsed: unknown = JSON.parse(fs.readFileSync(file, "utf-8"));
    if (!Array.isArray(parsed)) {
      warnStoreProblem(file, "top-level value must be an array");
      return [];
    }
    if (parsed.length > MAX_STORE_ENTRIES) {
      warnStoreProblem(file, `more than ${MAX_STORE_ENTRIES} entries`);
    }
    const result: T[] = [];
    let invalid = Math.max(0, parsed.length - MAX_STORE_ENTRIES);
    for (const value of parsed.slice(0, MAX_STORE_ENTRIES)) {
      const item = validate(value);
      if (item === undefined) invalid += 1;
      else result.push(item);
    }
    if (invalid > 0) {
      warnStoreProblem(file, `${invalid} invalid or excess entr${invalid === 1 ? "y" : "ies"}`);
    }
    return result;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      warnStoreProblem(file, "unreadable or malformed JSON");
    }
    return [];
  }
}

function writeJSON(file: string, data: unknown): void {
  const serialized = JSON.stringify(data, null, 2);
  if (Buffer.byteLength(serialized, "utf-8") > MAX_STORE_FILE_BYTES) {
    throw new Error("Store exceeds the 8 MiB safety limit");
  }

  ensureDir(path.dirname(file));
  try {
    const existing = fs.lstatSync(file);
    if (existing.isSymbolicLink() || !existing.isFile()) {
      throw new Error("Unsafe storage file");
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const temporary = path.join(
    path.dirname(file),
    `.${path.basename(file)}.${process.pid}.${randomBytes(8).toString("hex")}.tmp`,
  );
  try {
    fs.writeFileSync(temporary, serialized, {
      encoding: "utf-8",
      flag: "wx",
      mode: 0o600,
    });
    fs.renameSync(temporary, file);
  } finally {
    try {
      fs.unlinkSync(temporary);
    } catch {
      // Best-effort cleanup: never mask the actual write/rename outcome.
    }
  }
}

function canWriteScope(scope: StorageScope, kind: string): boolean {
  if (scope !== "workspace" || vscode.workspace.isTrusted !== false) {
    return true;
  }
  void vscode.window.showWarningMessage(
    `ts-chef: workspace ${kind} cannot be changed in Restricted Mode.`,
  );
  return false;
}

function canLoadScope(scope: StorageScope): boolean {
  return scope !== "workspace" || vscode.workspace.isTrusted !== false;
}

// ---- Variables ----

export interface Variable {
  name: string;
  value: string;
  description?: string;
}

export interface ScopedVariable extends Variable {
  scope: StorageScope;
}

function validatedVariable(value: unknown): Variable | undefined {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    return undefined;
  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.name !== "string" ||
    !candidate.name.trim() ||
    candidate.name.length > 200 ||
    typeof candidate.value !== "string" ||
    candidate.value.length > 1024 * 1024 ||
    (candidate.description !== undefined &&
      (typeof candidate.description !== "string" ||
        candidate.description.length > 8_000))
  ) {
    return undefined;
  }
  return {
    name: candidate.name,
    value: candidate.value,
    ...(typeof candidate.description === "string"
      ? { description: candidate.description }
      : {}),
  };
}

/**
 * Persists named variables to JSON files in both workspace and global storage scopes.
 * Workspace variables take precedence over global ones when names collide.
 */
export class VariableStore {
  constructor(private readonly globalDir: string) {}

  private dir(scope: StorageScope): string | undefined {
    return scope === "global" ? this.globalDir : workspaceStoreDir();
  }

  load(scope: StorageScope): Variable[] {
    if (!canLoadScope(scope)) return [];
    const dir = this.dir(scope);
    if (!dir) return [];
    return readValidatedArray(
      path.join(dir, "variables.json"),
      validatedVariable,
    );
  }

  /** Merged view of both scopes; workspace items first (drives precedence). */
  loadAll(): ScopedVariable[] {
    const ws = this.load("workspace").map((v) => ({
      ...v,
      scope: "workspace" as const,
    }));
    const gl = this.load("global").map((v) => ({
      ...v,
      scope: "global" as const,
    }));
    return [...ws, ...gl];
  }

  save(scope: StorageScope, vars: Variable[]): boolean {
    if (!canWriteScope(scope, "variables")) return false;
    const dir = this.dir(scope);
    if (!dir) {
      vscode.window.showWarningMessage(
        "ts-chef: open a workspace folder to save workspace variables.",
      );
      return false;
    }
    const validated = vars.map(validatedVariable);
    if (validated.some((item) => item === undefined)) {
      void vscode.window.showWarningMessage(
        "ts-chef: refused to save invalid variable data.",
      );
      return false;
    }
    try {
      writeJSON(path.join(dir, "variables.json"), validated);
      return true;
    } catch {
      void vscode.window.showWarningMessage(
        "ts-chef: unable to write the variable store.",
      );
      return false;
    }
  }

  /** Resolve a value by name, workspace overriding global. */
  get(name: string): string | undefined {
    const ws = this.load("workspace").find((v) => v.name === name);
    if (ws) return ws.value;
    return this.load("global").find((v) => v.name === name)?.value;
  }

  set(
    scope: StorageScope,
    name: string,
    value: string,
    description?: string,
  ): boolean {
    const vars = this.load(scope).filter((v) => v.name !== name);
    vars.push({ name, value, description });
    return this.save(scope, vars);
  }

  delete(scope: StorageScope, name: string): boolean {
    return this.save(
      scope,
      this.load(scope).filter((v) => v.name !== name),
    );
  }
}

// ---- Pipelines ----

export interface PipelineStep {
  opName: string;
  args: unknown[];
}

export interface Pipeline {
  name: string;
  description?: string;
  steps: PipelineStep[];
  raw: string; // original pipe syntax
}

export interface ScopedPipeline extends Pipeline {
  scope: StorageScope;
}

const MAX_PIPELINE_ARGUMENT_ITEMS = 100_000;
const MAX_PIPELINE_ARGUMENT_CHARACTERS = 4 * 1024 * 1024;

function isSafeStoredValue(
  value: unknown,
  depth: number,
  budget: { items: number; characters: number },
): boolean {
  budget.items -= 1;
  if (budget.items < 0 || depth > 12) return false;
  if (typeof value === "string") {
    budget.characters -= value.length;
    return value.length <= 1024 * 1024 && budget.characters >= 0;
  }
  if (
    value === null ||
    value === undefined ||
    typeof value === "boolean"
  ) {
    return true;
  }
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) {
    return value.every((item) =>
      isSafeStoredValue(item, depth + 1, budget),
    );
  }
  if (typeof value !== "object") return false;
  return Object.entries(value).every(
    ([key, item]) =>
      key.length <= 4_096 &&
      (budget.characters -= key.length) >= 0 &&
      isSafeStoredValue(item, depth + 1, budget),
  );
}

function validatedPipeline(value: unknown): Pipeline | undefined {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    return undefined;
  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.name !== "string" ||
    !candidate.name.trim() ||
    candidate.name.length > 200 ||
    typeof candidate.raw !== "string" ||
    candidate.raw.length > 256_000 ||
    (candidate.description !== undefined &&
      (typeof candidate.description !== "string" ||
        candidate.description.length > 8_000)) ||
    !Array.isArray(candidate.steps) ||
    candidate.steps.length > 512
  ) {
    return undefined;
  }

  const budget = {
    items: MAX_PIPELINE_ARGUMENT_ITEMS,
    characters: MAX_PIPELINE_ARGUMENT_CHARACTERS,
  };
  const steps: PipelineStep[] = [];
  for (const valueStep of candidate.steps) {
    if (
      valueStep === null ||
      typeof valueStep !== "object" ||
      Array.isArray(valueStep)
    ) {
      return undefined;
    }
    const step = valueStep as Record<string, unknown>;
    if (
      typeof step.opName !== "string" ||
      !step.opName ||
      step.opName.length > 256 ||
      !Array.isArray(step.args) ||
      step.args.length > 256 ||
      !step.args.every((arg) => isSafeStoredValue(arg, 0, budget))
    ) {
      return undefined;
    }
    steps.push({ opName: step.opName, args: step.args });
  }

  return {
    name: candidate.name,
    raw: candidate.raw,
    steps,
    ...(typeof candidate.description === "string"
      ? { description: candidate.description }
      : {}),
  };
}

/**
 * Persists named pipelines (steps + raw pipe-syntax) to JSON files in both
 * workspace and global storage scopes, with workspace entries taking precedence.
 */
export class PipelineStore {
  constructor(private readonly globalDir: string) {}

  private dir(scope: StorageScope): string | undefined {
    return scope === "global" ? this.globalDir : workspaceStoreDir();
  }

  load(scope: StorageScope): Pipeline[] {
    if (!canLoadScope(scope)) return [];
    const dir = this.dir(scope);
    if (!dir) return [];
    return readValidatedArray(
      path.join(dir, "pipelines.json"),
      validatedPipeline,
    );
  }

  /** Merged view of both scopes; workspace items first (drives precedence). */
  loadAll(): ScopedPipeline[] {
    const ws = this.load("workspace").map((p) => ({
      ...p,
      scope: "workspace" as const,
    }));
    const gl = this.load("global").map((p) => ({
      ...p,
      scope: "global" as const,
    }));
    return [...ws, ...gl];
  }

  /** Find a pipeline by name across both scopes, workspace overriding global. */
  findByName(name: string): ScopedPipeline | undefined {
    return this.loadAll().find((p) => p.name === name);
  }

  save(scope: StorageScope, pipelines: Pipeline[]): boolean {
    if (!canWriteScope(scope, "pipelines")) return false;
    const dir = this.dir(scope);
    if (!dir) {
      vscode.window.showWarningMessage(
        "ts-chef: open a workspace folder to save workspace pipelines.",
      );
      return false;
    }
    const validated = pipelines.map(validatedPipeline);
    if (validated.some((pipeline) => pipeline === undefined)) {
      void vscode.window.showWarningMessage(
        "ts-chef: refused to save invalid pipeline data.",
      );
      return false;
    }
    try {
      writeJSON(path.join(dir, "pipelines.json"), validated);
      return true;
    } catch {
      void vscode.window.showWarningMessage(
        "ts-chef: unable to write the pipeline store.",
      );
      return false;
    }
  }

  upsert(scope: StorageScope, pipeline: Pipeline): boolean {
    const list = this.load(scope).filter((p) => p.name !== pipeline.name);
    list.push(pipeline);
    return this.save(scope, list);
  }

  delete(scope: StorageScope, name: string): boolean {
    return this.save(
      scope,
      this.load(scope).filter((p) => p.name !== name),
    );
  }
}
