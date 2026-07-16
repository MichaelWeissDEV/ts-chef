/**
 * @fileoverview store.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { VariableStore, PipelineStore, Pipeline } from "../src/storage/store";
import {
  __reset,
  __setWorkspaceFolder,
  __setWorkspaceTrusted,
  showWarningMessage,
} from "./vscode-mock";

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
    expect(store.load("workspace")).toEqual([{ name: "k", value: "v" }]);
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

  test("ignores malformed variable-store entries without crashing", () => {
    fs.writeFileSync(
      path.join(globalDir, "variables.json"),
      JSON.stringify([{}, { name: "good", value: "value" }, { name: "bad" }]),
    );
    const store = new VariableStore(globalDir);
    expect(store.loadAll().map((item) => item.name)).toEqual(["good"]);
    expect(showWarningMessage).toHaveBeenCalled();
  });

  test("refuses workspace writes in Restricted Mode", () => {
    __setWorkspaceFolder(wsDir);
    __setWorkspaceTrusted(false);
    const store = new VariableStore(globalDir);
    expect(store.set("workspace", "secret", "value")).toBe(false);
    expect(fs.existsSync(path.join(wsDir, ".ts-chef"))).toBe(false);
    expect(showWarningMessage).toHaveBeenCalled();
  });

  test("does not load workspace variables in Restricted Mode", () => {
    __setWorkspaceFolder(wsDir);
    const storeDir = path.join(wsDir, ".ts-chef");
    fs.mkdirSync(storeDir);
    fs.writeFileSync(
      path.join(storeDir, "variables.json"),
      JSON.stringify([{ name: "workspace-secret", value: "value" }]),
    );
    __setWorkspaceTrusted(false);
    const store = new VariableStore(globalDir);

    expect(store.load("workspace")).toEqual([]);
    expect(store.get("workspace-secret")).toBeUndefined();
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

  test("treats a non-array pipeline file as empty instead of crashing", () => {
    fs.writeFileSync(path.join(globalDir, "pipelines.json"), "{}");
    const store = new PipelineStore(globalDir);
    expect(store.loadAll()).toEqual([]);
    expect(showWarningMessage).toHaveBeenCalled();
  });

  test("keeps valid pipelines while skipping malformed entries", () => {
    fs.writeFileSync(
      path.join(globalDir, "pipelines.json"),
      JSON.stringify([
        {},
        pipe("good", "To Hex"),
        { name: "missing fields" },
        {
          name: "bad args",
          raw: "To Hex",
          steps: [{ opName: "ToHex", args: [{ nested: { too: "deep" } }] }],
        },
      ]),
    );
    const store = new PipelineStore(globalDir);
    expect(store.load("global").map((pipeline) => pipeline.name)).toEqual([
      "good",
      "bad args",
    ]);
    expect(showWarningMessage).toHaveBeenCalled();
  });

  test("rejects deeply nested pipeline arguments", () => {
    let nested: unknown = "leaf";
    for (let i = 0; i < 20; i++) nested = [nested];
    fs.writeFileSync(
      path.join(globalDir, "pipelines.json"),
      JSON.stringify([
        pipe("good", "To Hex"),
        {
          name: "deep",
          raw: "Reverse",
          steps: [{ opName: "Reverse", args: [nested] }],
        },
      ]),
    );
    const store = new PipelineStore(globalDir);
    expect(store.load("global").map((pipeline) => pipeline.name)).toEqual([
      "good",
    ]);
  });

  test("does not follow a workspace .vscode directory symlink", () => {
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "tschef-outside-"));
    fs.symlinkSync(outside, path.join(wsDir, ".vscode"), "dir");
    __setWorkspaceFolder(wsDir);
    const store = new PipelineStore(globalDir);

    expect(store.upsert("workspace", pipe("p", "To Hex"))).toBe(false);
    expect(fs.existsSync(path.join(outside, "ts-chef", "pipelines.json"))).toBe(
      false,
    );
    expect(showWarningMessage).toHaveBeenCalled();
  });

  test("does not follow a workspace store directory symlink", () => {
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "tschef-outside-"));
    fs.symlinkSync(outside, path.join(wsDir, ".ts-chef"), "dir");
    __setWorkspaceFolder(wsDir);
    const store = new PipelineStore(globalDir);

    expect(store.upsert("workspace", pipe("p", "To Hex"))).toBe(false);
    expect(fs.existsSync(path.join(outside, "pipelines.json"))).toBe(false);
  });

  test("does not follow an existing store-file symlink", () => {
    const outside = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), "tschef-outside-")),
      "target.json",
    );
    fs.writeFileSync(outside, "do not replace");
    fs.symlinkSync(outside, path.join(globalDir, "pipelines.json"), "file");
    const store = new PipelineStore(globalDir);

    expect(store.upsert("global", pipe("p", "To Hex"))).toBe(false);
    expect(fs.readFileSync(outside, "utf-8")).toBe("do not replace");
  });

  test("writes stores atomically without leaving temporary files", () => {
    const store = new PipelineStore(globalDir);
    expect(store.upsert("global", pipe("p", "To Hex"))).toBe(true);
    expect(fs.readdirSync(globalDir)).toEqual(["pipelines.json"]);
    expect(fs.lstatSync(path.join(globalDir, "pipelines.json")).isFile()).toBe(
      true,
    );
  });

  test("does not load executable workspace pipelines in Restricted Mode", () => {
    const storeDir = path.join(wsDir, ".ts-chef");
    fs.mkdirSync(storeDir);
    fs.writeFileSync(
      path.join(storeDir, "pipelines.json"),
      JSON.stringify([
        {
          name: "Decode harmless data",
          raw: "HTTPRequest",
          steps: [{ opName: "HTTPRequest", args: ["POST", "https://example.invalid"] }],
        },
      ]),
    );
    __setWorkspaceFolder(wsDir);
    __setWorkspaceTrusted(false);
    const store = new PipelineStore(globalDir);

    expect(store.load("workspace")).toEqual([]);
    expect(store.findByName("Decode harmless data")).toBeUndefined();
  });
});
