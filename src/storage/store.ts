import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

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
  if (fs.existsSync(vscodePath)) return path.join(vscodePath, "ts-chef");
  return path.join(ws, ".ts-chef");
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJSON<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(file: string, data: unknown): void {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
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

export class VariableStore {
  constructor(private readonly globalDir: string) {}

  private dir(scope: StorageScope): string | undefined {
    return scope === "global" ? this.globalDir : workspaceStoreDir();
  }

  load(scope: StorageScope): Variable[] {
    const dir = this.dir(scope);
    if (!dir) return [];
    return readJSON<Variable[]>(path.join(dir, "variables.json"), []);
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

  save(scope: StorageScope, vars: Variable[]): void {
    const dir = this.dir(scope);
    if (!dir) {
      vscode.window.showWarningMessage(
        "ts-chef: open a workspace folder to save workspace variables.",
      );
      return;
    }
    ensureDir(dir);
    writeJSON(path.join(dir, "variables.json"), vars);
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
  ): void {
    const vars = this.load(scope).filter((v) => v.name !== name);
    vars.push({ name, value, description });
    this.save(scope, vars);
  }

  delete(scope: StorageScope, name: string): void {
    this.save(
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

export class PipelineStore {
  constructor(private readonly globalDir: string) {}

  private dir(scope: StorageScope): string | undefined {
    return scope === "global" ? this.globalDir : workspaceStoreDir();
  }

  load(scope: StorageScope): Pipeline[] {
    const dir = this.dir(scope);
    if (!dir) return [];
    return readJSON<Pipeline[]>(path.join(dir, "pipelines.json"), []);
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

  save(scope: StorageScope, pipelines: Pipeline[]): void {
    const dir = this.dir(scope);
    if (!dir) {
      vscode.window.showWarningMessage(
        "ts-chef: open a workspace folder to save workspace pipelines.",
      );
      return;
    }
    ensureDir(dir);
    writeJSON(path.join(dir, "pipelines.json"), pipelines);
  }

  upsert(scope: StorageScope, pipeline: Pipeline): void {
    const list = this.load(scope).filter((p) => p.name !== pipeline.name);
    list.push(pipeline);
    this.save(scope, list);
  }

  delete(scope: StorageScope, name: string): void {
    this.save(
      scope,
      this.load(scope).filter((p) => p.name !== name),
    );
  }
}
