import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

function getStoreDir(): string | undefined {
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

export class VariableStore {
  private get file(): string | undefined {
    const dir = getStoreDir();
    return dir ? path.join(dir, "variables.json") : undefined;
  }

  load(): Variable[] {
    const f = this.file;
    if (!f) return [];
    return readJSON<Variable[]>(f, []);
  }

  save(vars: Variable[]): void {
    const dir = getStoreDir();
    if (!dir) {
      vscode.window.showWarningMessage(
        "ts-chef: open a workspace folder to save variables.",
      );
      return;
    }
    ensureDir(dir);
    writeJSON(this.file!, vars);
  }

  get(name: string): string | undefined {
    return this.load().find((v) => v.name === name)?.value;
  }

  set(name: string, value: string, description?: string): void {
    const vars = this.load().filter((v) => v.name !== name);
    vars.push({ name, value, description });
    this.save(vars);
  }

  delete(name: string): void {
    this.save(this.load().filter((v) => v.name !== name));
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

export class PipelineStore {
  private get file(): string | undefined {
    const dir = getStoreDir();
    return dir ? path.join(dir, "pipelines.json") : undefined;
  }

  load(): Pipeline[] {
    const f = this.file;
    if (!f) return [];
    return readJSON<Pipeline[]>(f, []);
  }

  save(pipelines: Pipeline[]): void {
    const dir = getStoreDir();
    if (!dir) {
      vscode.window.showWarningMessage(
        "ts-chef: open a workspace folder to save pipelines.",
      );
      return;
    }
    ensureDir(dir);
    writeJSON(this.file!, pipelines);
  }

  upsert(pipeline: Pipeline): void {
    const list = this.load().filter((p) => p.name !== pipeline.name);
    list.push(pipeline);
    this.save(list);
  }

  delete(name: string): void {
    this.save(this.load().filter((p) => p.name !== name));
  }
}
