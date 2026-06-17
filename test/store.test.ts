import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { VariableStore, PipelineStore, Pipeline } from "../src/storage/store";
import { __reset, __setWorkspaceFolder, showWarningMessage } from "./vscode-mock";

let globalDir: string;
let wsDir: string;

beforeEach(() => {
  __reset();
  globalDir = fs.mkdtempSync(path.join(os.tmpdir(), "tschef-global-"));
  wsDir = fs.mkdtempSync(path.join(os.tmpdir(), "tschef-ws-"));
});

describe("VariableStore", () => {
  test("saves and loads in the global scope (no workspace needed)", () => {
    const store = new VariableStore(globalDir);
    store.set("global", "k", "v", "desc");
    expect(store.load("global")).toEqual([
      { name: "k", value: "v", description: "desc" },
    ]);
    expect(store.load("workspace")).toEqual([]);
  });

  test("saves and loads in the workspace scope", () => {
    __setWorkspaceFolder(wsDir);
    const store = new VariableStore(globalDir);
    store.set("workspace", "k", "v");
    expect(store.load("workspace")).toEqual([
      { name: "k", value: "v" },
    ]);
    expect(store.load("global")).toEqual([]);
  });

  test("loadAll lists workspace items before global", () => {
    __setWorkspaceFolder(wsDir);
    const store = new VariableStore(globalDir);
    store.set("global", "g", "1");
    store.set("workspace", "w", "2");
    expect(store.loadAll().map((v) => [v.name, v.scope])).toEqual([
      ["w", "workspace"],
      ["g", "global"],
    ]);
  });

  test("get resolves with workspace overriding global", () => {
    __setWorkspaceFolder(wsDir);
    const store = new VariableStore(globalDir);
    store.set("global", "k", "global-value");
    store.set("workspace", "k", "workspace-value");
    expect(store.get("k")).toBe("workspace-value");
  });

  test("get falls back to global when not in workspace", () => {
    __setWorkspaceFolder(wsDir);
    const store = new VariableStore(globalDir);
    store.set("global", "only-global", "g");
    expect(store.get("only-global")).toBe("g");
  });

  test("delete only affects the named scope", () => {
    __setWorkspaceFolder(wsDir);
    const store = new VariableStore(globalDir);
    store.set("global", "k", "g");
    store.set("workspace", "k", "w");
    store.delete("workspace", "k");
    expect(store.load("workspace")).toEqual([]);
    expect(store.load("global")).toEqual([{ name: "k", value: "g" }]);
  });

  test("saving to workspace without a folder warns and is a no-op", () => {
    const store = new VariableStore(globalDir);
    store.set("workspace", "k", "v");
    expect(showWarningMessage).toHaveBeenCalled();
    expect(store.load("workspace")).toEqual([]);
  });
});

describe("PipelineStore", () => {
  const pipe = (name: string, raw: string): Pipeline => ({
    name,
    raw,
    steps: [{ opName: "To Hex", args: [] }],
  });

  test("upsert replaces by name within a scope", () => {
    const store = new PipelineStore(globalDir);
    store.upsert("global", pipe("p", "To Hex"));
    store.upsert("global", pipe("p", "To Base64"));
    const all = store.load("global");
    expect(all).toHaveLength(1);
    expect(all[0].raw).toBe("To Base64");
  });

  test("findByName resolves with workspace overriding global", () => {
    __setWorkspaceFolder(wsDir);
    const store = new PipelineStore(globalDir);
    store.upsert("global", pipe("p", "global-raw"));
    store.upsert("workspace", pipe("p", "workspace-raw"));
    const found = store.findByName("p");
    expect(found?.raw).toBe("workspace-raw");
    expect(found?.scope).toBe("workspace");
  });

  test("findByName returns undefined for unknown names", () => {
    const store = new PipelineStore(globalDir);
    expect(store.findByName("nope")).toBeUndefined();
  });

  test("delete only affects the named scope", () => {
    __setWorkspaceFolder(wsDir);
    const store = new PipelineStore(globalDir);
    store.upsert("global", pipe("p", "g"));
    store.upsert("workspace", pipe("p", "w"));
    store.delete("global", "p");
    expect(store.load("global")).toEqual([]);
    expect(store.findByName("p")?.scope).toBe("workspace");
  });
});
