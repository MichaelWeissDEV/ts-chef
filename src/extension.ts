/**
 * @fileoverview VS Code extension entry point for ts-chef
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import * as vscode from "vscode";
import { ScanState } from "./providers/scanState";
import { DecorationProvider } from "./providers/decorationProvider";
import { HoverProvider } from "./providers/hoverProvider";
import { PatternsTreeProvider } from "./providers/patternsTreeProvider";
import { VariablesTreeProvider } from "./providers/variablesTreeProvider";
import { PipelinesTreeProvider } from "./providers/pipelinesTreeProvider";
import {
  VariableStore,
  PipelineStore,
  type StorageScope,
} from "./storage/store";
import { PipelinePanel } from "./panels/pipelinePanel";
import {
  runOp,
  runOpAsync,
  parsePipeline,
  runPipeline,
  resolveDefaultArg,
} from "./commands/runner";
import { EntropyMapProvider } from "./providers/entropyMapProvider";
import { detectFormat, makeReadable } from "./providers/format";
import {
  presentPipelineResult,
  type ResultRenderer,
} from "./commands/pipelineResult";
import { InlineResultController } from "./commands/inlineResult";
import { WebviewResultController } from "./commands/webviewResult";
import {
  OperationsViewProvider,
  type OpInfo,
} from "./providers/operationsViewProvider";
import {
  RecipeViewProvider,
  type RecipeStep,
} from "./providers/recipeViewProvider";
import { pickScope } from "./commands/scopePicker";

/** The configured default scope for a given preset kind. */
function defaultScope(
  key: "defaultVariableScope" | "defaultPipelineScope",
): StorageScope {
  return vscode.workspace
    .getConfiguration("tschef")
    .get<StorageScope>(key, "global");
}
import {
  magicAnalyse,
  stringStats,
  type MagicChain,
} from "./providers/magic";
import { initOutputChannel, log } from "./logger";
import registry from "./opsRegistry";
import type { ArgConfig, Operation } from "./chef/Operation";

function resultToString(result: unknown): string {
  if (Array.isArray(result))
    return Buffer.from(result as number[]).toString("utf-8");
  if (typeof result === "string") return result;
  if (result === null || result === undefined) return "";
  return JSON.stringify(result, null, 2);
}

/** Replace $varName / {{varName}} references with stored variable values. */
function resolveVars(text: string, varStore: VariableStore): string {
  return text
    .replace(
      /\{\{([^}]+)\}\}/g,
      (_, name) => varStore.get(name.trim()) ?? `{{${name}}}`,
    )
    .replace(
      /\$([A-Za-z_][A-Za-z0-9_-]*)/g,
      (_, name) => varStore.get(name) ?? `$${name}`,
    );
}

async function promptForArgs(opInstance: Operation): Promise<unknown[] | null> {
  const result: unknown[] = [];
  for (const argDef of opInstance.args) {
    if (argDef.type === "toggleString" && (argDef.value as string) === "") {
      const strVal = await vscode.window.showInputBox({
        prompt: argDef.name,
        placeHolder: `Enter ${argDef.name.toLowerCase()} (encoding: ${argDef.toggleValues?.join(" / ") ?? "Hex"})`,
      });
      if (strVal === undefined) return null;
      const encoding =
        argDef.toggleValues && argDef.toggleValues.length > 1
          ? await vscode.window.showQuickPick(argDef.toggleValues, {
              placeHolder: `Encoding for "${argDef.name}"`,
            })
          : argDef.toggleValues?.[0];
      if (encoding === undefined) return null;
      result.push({ string: strVal, option: encoding });
    } else {
      result.push(resolveDefaultArg(argDef));
    }
  }
  return result;
}

function buildOpPickItems(): (vscode.QuickPickItem & { opName?: string })[] {
  const byModule = new Map<string, typeof registry>();
  for (const e of registry) {
    const mod = e.module || "Other";
    if (!byModule.has(mod)) byModule.set(mod, []);
    byModule.get(mod)!.push(e);
  }
  const items: (vscode.QuickPickItem & { opName?: string })[] = [];
  for (const [mod, ops] of byModule) {
    items.push({ label: mod, kind: vscode.QuickPickItemKind.Separator });
    for (const e of ops) {
      const inst = e.factory();
      const needsInput = inst.args.some(
        (a) => a.type === "toggleString" && (a.value as string) === "",
      );
      const requiredNames = inst.args
        .filter((a) => a.type === "toggleString" && (a.value as string) === "")
        .map((a) => a.name)
        .join(", ");
      items.push({
        label: e.displayName,
        description: needsInput ? `$(key) needs: ${requiredNames}` : undefined,
        opName: e.opName,
      });
    }
  }
  return items;
}

/**
 * Extension entry point called by VS Code when the extension is first activated.
 * Registers all providers, tree views, commands, and event listeners for the lifetime
 * of the extension.
 *
 * @param context - The extension context used to register disposables and access storage.
 */
export function activate(context: vscode.ExtensionContext): void {
  initOutputChannel(context);
  log("Extension activated");

  const scanState = new ScanState();
  const decorations = new DecorationProvider(scanState);
  const entropyMap = new EntropyMapProvider();
  context.subscriptions.push({ dispose: () => entropyMap.dispose() });
  const globalDir = context.globalStorageUri.fsPath;
  const varStore = new VariableStore(globalDir);
  const pipeStore = new PipelineStore(globalDir);

  const patternsTree = new PatternsTreeProvider(scanState);
  const varTree = new VariablesTreeProvider(varStore);
  const pipeTree = new PipelinesTreeProvider(pipeStore);

  // Custom result presenters for the `inline` / `panel` modes, injected into
  // presentPipelineResult via the renderer map below.
  const inlineResult = new InlineResultController();
  const webviewResult = new WebviewResultController();
  inlineResult.register(context);
  webviewResult.register(context);
  const resultRenderers: Partial<Record<"inline" | "panel", ResultRenderer>> = {
    inline: (editor, result) => inlineResult.show(editor, result),
    panel: (editor, result) => webviewResult.show(editor, result),
  };

  // Lazily instantiate operations only when their arg defs are first needed,
  // so the ~479 ops aren't all constructed at startup.
  const argDefsCache = new Map<string, ArgConfig[]>();
  const argDefsFor = (opName: string): ArgConfig[] | undefined => {
    const cached = argDefsCache.get(opName);
    if (cached) return cached;
    const entry = registry.find((e) => e.opName === opName);
    if (!entry) return undefined;
    const defs = entry.factory().args;
    argDefsCache.set(opName, defs);
    return defs;
  };
  const displayNameFor = (opName: string): string =>
    registry.find((e) => e.opName === opName)?.displayName ?? opName;

  // ---- Operations + Recipe sidebars (WebviewViews) ----
  const recipeView = new RecipeViewProvider({
    argDefsFor,
    displayNameFor,
    apply: (steps) => applyRecipeToSelection(steps),
    save: (name, steps) => saveRecipeAsPipeline(name, steps),
  });
  const operationsView = new OperationsViewProvider({
    listOps: (): OpInfo[] =>
      registry.map((e) => ({
        opName: e.opName,
        displayName: e.displayName,
        module: e.module || "Other",
      })),
    apply: (opName) =>
      vscode.commands.executeCommand("tschef.applyOperation", opName),
    addToRecipe: (opName) => recipeView.addOperation(opName),
  });

  /** Resolve the editor's input text (selection, else whole document). */
  function selectionInput(editor: vscode.TextEditor): string {
    const raw = editor.selection.isEmpty
      ? editor.document.getText()
      : editor.document.getText(editor.selection);
    return resolveVars(raw, varStore);
  }

  async function applyRecipeToSelection(steps: RecipeStep[]): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage("ts-chef: No active editor.");
      return;
    }
    if (!steps.length) {
      vscode.window.showWarningMessage("ts-chef: The recipe is empty.");
      return;
    }
    try {
      const result = await runPipeline(selectionInput(editor), steps);
      log(`Recipe applied: ${steps.length} step(s)`);
      await presentPipelineResult(editor, result, "Recipe", resultRenderers);
    } catch (e) {
      log(`Recipe error: ${e}`);
      vscode.window.showErrorMessage(`ts-chef recipe error: ${e}`);
    }
  }

  async function saveRecipeAsPipeline(
    name: string,
    steps: RecipeStep[],
  ): Promise<void> {
    if (!name) {
      vscode.window.showWarningMessage(
        "ts-chef: Name the recipe before saving.",
      );
      return;
    }
    if (!steps.length) {
      vscode.window.showWarningMessage("ts-chef: The recipe is empty.");
      return;
    }
    const scope = await pickScope(
      defaultScope("defaultPipelineScope"),
      `Save recipe "${name}"`,
    );
    if (!scope) return;
    const raw = steps.map((s) => displayNameFor(s.opName)).join(" | ");
    pipeStore.upsert(scope, { name, raw, steps });
    pipeTree.refresh();
    log(
      `Recipe "${name}" saved as pipeline (${steps.length} step(s), ${scope})`,
    );
    vscode.window.showInformationMessage(
      `ts-chef: Recipe "${name}" saved (${scope}).`,
    );
  }

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("tschef.patternsView", patternsTree),
    vscode.window.registerTreeDataProvider("tschef.variablesView", varTree),
    vscode.window.registerTreeDataProvider("tschef.pipelinesView", pipeTree),
    vscode.window.registerWebviewViewProvider(
      OperationsViewProvider.viewType,
      operationsView,
    ),
    vscode.window.registerWebviewViewProvider(
      RecipeViewProvider.viewType,
      recipeView,
    ),
    vscode.languages.registerHoverProvider(
      { scheme: "*" },
      new HoverProvider(scanState),
    ),
  );

  let debounceTimeout: NodeJS.Timeout | undefined;
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        decorations.update(editor);
        entropyMap.update(editor);
      }
    }),
    vscode.workspace.onDidChangeTextDocument((e) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && e.document === editor.document) {
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }
        debounceTimeout = setTimeout(() => {
          decorations.update(editor);
          entropyMap.update(editor);
        }, 200);
      }
    }),
  );

  // ---- Commands ----

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.scanDocument", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("ts-chef: No active editor.");
        return;
      }
      const matches = scanState.scan(editor.document);
      decorations.update(editor);
      log(
        `Scanned "${editor.document.fileName}": ${matches.length} pattern(s) found`,
      );
      vscode.window.showInformationMessage(
        `ts-chef: Found ${matches.length} pattern(s).`,
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.toggleHighlight", () => {
      decorations.toggle();
      const state = decorations.isEnabled() ? "enabled" : "disabled";
      log(`Highlighting ${state}`);
      vscode.window.showInformationMessage(`ts-chef: Highlighting ${state}.`);
      if (decorations.isEnabled()) {
        const editor = vscode.window.activeTextEditor;
        if (editor) decorations.update(editor);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.clearScanResults", () => {
      scanState.clear();
      const editor = vscode.window.activeTextEditor;
      if (editor) decorations.update(editor);
      log("Scan results cleared");
    }),
  );

  // tschef.scanWorkspace — scan every (text) file in the workspace for patterns
  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.scanWorkspace", async () => {
      const include =
        "**/*.{txt,log,json,xml,yaml,yml,md,csv,ini,conf,cfg,env,toml,js,jsx,ts,tsx,py,sh,ps1,bat,html,htm,php,java,go,rb,c,cpp,h}";
      const exclude =
        "**/{node_modules,.git,dist,out,build,coverage,vendor}/**";
      const files = await vscode.workspace.findFiles(include, exclude, 300);
      if (!files.length) {
        vscode.window.showInformationMessage(
          "ts-chef: No scannable files found in the workspace.",
        );
        return;
      }

      let totalMatches = 0;
      let filesWithHits = 0;
      let scanned = 0;
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "ts-chef: Scanning workspace",
          cancellable: true,
        },
        async (progress, token) => {
          for (const uri of files) {
            if (token.isCancellationRequested) break;
            progress.report({
              message: `${scanned + 1}/${files.length} — ${uri.path.split("/").pop()}`,
              increment: 100 / files.length,
            });
            try {
              const stat = await vscode.workspace.fs.stat(uri);
              if (stat.size > 512 * 1024) continue; // skip huge files
              const doc = await vscode.workspace.openTextDocument(uri);
              const matches = scanState.scan(doc, false);
              scanned++;
              if (matches.length) {
                filesWithHits++;
                totalMatches += matches.length;
              }
            } catch {
              // unreadable/binary file — skip
            }
          }
        },
      );
      scanState.notify();
      const editor = vscode.window.activeTextEditor;
      if (editor) decorations.update(editor);
      log(
        `Workspace scan: ${scanned} file(s) scanned, ${totalMatches} pattern(s) in ${filesWithHits} file(s)`,
      );
      vscode.window.showInformationMessage(
        `ts-chef: Found ${totalMatches} pattern(s) in ${filesWithHits} of ${scanned} scanned file(s).`,
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.refreshScan", () => {
      vscode.commands.executeCommand("tschef.scanDocument");
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "tschef.revealMatch",
      (uri: vscode.Uri, range: vscode.Range) => {
        vscode.window.showTextDocument(uri).then((editor) => {
          editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
          editor.selection = new vscode.Selection(range.start, range.end);
        });
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.quickConvert", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const selection = editor.selection;
      const rawText = editor.document.getText(selection);
      if (!rawText) {
        vscode.window.showWarningMessage("ts-chef: Select text first.");
        return;
      }
      const text = resolveVars(rawText, varStore);

      const picked = await vscode.window.showQuickPick(buildOpPickItems(), {
        placeHolder: "Pick a ts-chef operation…",
        matchOnDescription: true,
      });
      if (!picked || !picked.opName) return;

      const entry = registry.find((e) => e.opName === picked.opName);
      if (!entry) return;
      const opInstance = entry.factory();
      const args = await promptForArgs(opInstance);
      if (args === null) return;

      try {
        const str = resultToString(runOp(picked.opName, text, args));
        if (str === "" && text !== "") {
          vscode.window.showWarningMessage(
            `ts-chef: "${picked.label}" produced an empty result — nothing replaced.`,
          );
          return;
        }
        await editor.edit((eb) => eb.replace(selection, str));
        log(`quickConvert: "${picked.label}" applied`);
        vscode.window.setStatusBarMessage(
          `ts-chef: Applied "${picked.label}"`,
          3000,
        );
      } catch (e) {
        log(`quickConvert error: ${e}`);
        vscode.window.showErrorMessage(`ts-chef: ${e}`);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "tschef.applyConversion",
      async (
        payload: { opName: string; value: string; args: unknown[] } | string,
      ) => {
        const data =
          typeof payload === "string"
            ? JSON.parse(decodeURIComponent(payload))
            : payload;
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const matches = scanState.get(editor.document.uri);
        const match = matches.find((m) => m.value === data.value);
        if (!match) return;

        try {
          const str = resultToString(runOp(data.opName, data.value, data.args));
          if (str === "" && data.value !== "") {
            vscode.window.showWarningMessage(
              `ts-chef: Operation produced an empty result — nothing replaced.`,
            );
            return;
          }
          await editor.edit((eb) => eb.replace(match.range, str));
          log(`applyConversion: "${data.opName}" applied`);
        } catch (e) {
          log(`applyConversion error: ${e}`);
          vscode.window.showErrorMessage(`ts-chef: ${e}`);
        }
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.setVariable", async () => {
      const name = await vscode.window.showInputBox({
        prompt: "Variable name (e.g. aes-key)",
      });
      if (!name) return;
      const value = await vscode.window.showInputBox({
        prompt: `Value for "${name}"`,
      });
      if (value === undefined) return;
      const desc = await vscode.window.showInputBox({
        prompt: "Description (optional)",
        placeHolder: "e.g. AES-256 key for project X",
      });
      const scope = await pickScope(
        defaultScope("defaultVariableScope"),
        `Save variable "${name}"`,
      );
      if (!scope) return;
      varStore.set(scope, name, value, desc ?? undefined);
      varTree.refresh();
      log(`Variable "${name}" set (${scope})`);
      vscode.window.showInformationMessage(
        `ts-chef: Variable "${name}" saved (${scope}).`,
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.showVariables", async () => {
      const vars = varStore.loadAll();
      if (!vars.length) {
        vscode.window.showInformationMessage("ts-chef: No variables defined.");
        return;
      }
      const items = vars.map((v) => ({
        label: v.name,
        description: `${v.value}  [${v.scope}]`,
        detail: v.description,
        name: v.name,
        scope: v.scope,
      }));
      const action = await vscode.window.showQuickPick(
        [
          { label: "$(add) Add variable", action: "add" as const },
          ...items.map((i) => ({ ...i, action: "inspect" as const })),
        ],
        { placeHolder: "Variables — pick to delete/edit" },
      );
      if (!action) return;
      if (action.action === "add") {
        vscode.commands.executeCommand("tschef.setVariable");
        return;
      }
      const choice = await vscode.window.showQuickPick(
        [
          { label: "$(edit) Edit value" },
          { label: "$(trash) Delete" },
          { label: "$(copy) Copy value" },
        ],
        { placeHolder: `Variable: ${action.name} (${action.scope})` },
      );
      if (!choice) return;
      if (choice.label.includes("Delete")) {
        varStore.delete(action.scope, action.name);
        varTree.refresh();
      }
      if (choice.label.includes("Edit")) {
        const newVal = await vscode.window.showInputBox({
          value: varStore.get(action.name),
          prompt: "New value",
        });
        if (newVal !== undefined) {
          varStore.set(action.scope, action.name, newVal);
          varTree.refresh();
        }
      }
      if (choice.label.includes("Copy")) {
        const v = varStore.get(action.name);
        if (v) vscode.env.clipboard.writeText(v);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.runPipeline", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const rawText =
        editor.document.getText(editor.selection) || editor.document.getText();
      const text = resolveVars(rawText, varStore);

      const raw = await vscode.window.showInputBox({
        prompt: "Pipeline (e.g. From Base64 | To Hex)",
        placeHolder: "op1 | op2(arg=val) | op3",
      });
      if (!raw) return;

      try {
        const steps = parsePipeline(raw);
        const result = await runPipeline(text, steps);
        log(
          `Pipeline ran: "${raw}", input ${text.length} chars → ${result.length} chars`,
        );
        await presentPipelineResult(editor, result, "Result", resultRenderers);
      } catch (e) {
        log(`Pipeline error: ${e}`);
        vscode.window.showErrorMessage(`ts-chef pipeline error: ${e}`);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.openPipelineEditor", () => {
      PipelinePanel.open(context, pipeStore);
      log("Pipeline editor opened");
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "tschef.runSavedPipeline",
      async (name: string) => {
        const pipeline = pipeStore.findByName(name);
        if (!pipeline) return;
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage("ts-chef: No active editor.");
          return;
        }
        const rawText =
          editor.document.getText(editor.selection) ||
          editor.document.getText();
        const text = resolveVars(rawText, varStore);
        try {
          const result = await runPipeline(text, pipeline.steps);
          log(
            `Ran saved pipeline "${name}": ${pipeline.steps.length} step(s), ${text.length} → ${result.length} chars`,
          );
          await presentPipelineResult(
            editor,
            result,
            `Pipeline "${name}"`,
            resultRenderers,
          );
        } catch (e) {
          log(`Saved pipeline "${name}" error: ${e}`);
          vscode.window.showErrorMessage(
            `ts-chef pipeline "${name}" error: ${e}`,
          );
        }
      },
    ),
  );

  // tschef.runSavedPipelinePicker — pick from saved pipelines via QuickPick
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "tschef.runSavedPipelinePicker",
      async () => {
        const pipelines = pipeStore.loadAll();
        if (!pipelines.length) {
          vscode.window.showInformationMessage(
            "ts-chef: No saved pipelines. Save one in the Pipeline Editor first.",
          );
          return;
        }
        const picked = await vscode.window.showQuickPick(
          pipelines.map((p) => ({
            label: p.name,
            description: `${p.description ?? ""}  [${p.scope}]`,
            detail: p.raw,
            name: p.name,
          })),
          {
            placeHolder: "Select a saved pipeline to run…",
            matchOnDescription: true,
            matchOnDetail: true,
          },
        );
        if (!picked) return;
        vscode.commands.executeCommand("tschef.runSavedPipeline", picked.name);
      },
    ),
  );

  // tschef.deepAnalysis — recursively analyse selected text: detect encodings,
  // follow multi-step decode chains (Magic) and show decoded previews.
  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.deepAnalysis", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const text = editor.document.getText(editor.selection);
      if (!text) {
        vscode.window.showWarningMessage("ts-chef: Select text to analyse.");
        return;
      }

      log(
        `Deep analysis: "${text.slice(0, 40)}${text.length > 40 ? "…" : ""}"`,
      );
      const trimmed = text.trim();
      const stats = stringStats(trimmed);
      const chains = magicAnalyse(trimmed);

      if (!chains.length) {
        vscode.window.showInformationMessage(
          `ts-chef: No recognisable encoding/format detected ` +
            `(${stats.length} chars, entropy ${stats.entropy} bits/char, ${stats.charset}).`,
        );
        return;
      }

      type ChainItem = vscode.QuickPickItem & { chain?: MagicChain };
      const items: ChainItem[] = [
        {
          label: `${stats.length} chars · entropy ${stats.entropy} bits/char · looks like ${stats.charset}`,
          kind: vscode.QuickPickItemKind.Separator,
        },
        ...chains.map((chain) => ({
          label: chain.steps.map((s) => s.label).join(" → "),
          description: `${Math.round(chain.confidence * 100)}%`,
          detail: `→ ${chain.preview.slice(0, 100).replace(/\s+/g, " ")}`,
          chain,
        })),
      ];

      const picked = await vscode.window.showQuickPick(items, {
        placeHolder: `Deep analysis: ${chains.length} decode path(s) found — pick to apply`,
        matchOnDetail: true,
      });
      if (!picked?.chain) return;

      try {
        const steps = picked.chain.steps.map((s) => ({
          opName: s.opName,
          args: s.args,
        }));
        const str = await runPipeline(trimmed, steps);
        log(
          `Deep analysis applied "${picked.label}": ${trimmed.length} → ${str.length} chars`,
        );
        await presentPipelineResult(editor, str, picked.label, resultRenderers);
      } catch (e) {
        log(`Deep analysis error: ${e}`);
        vscode.window.showErrorMessage(`ts-chef deep analysis error: ${e}`);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.addVariable", () => {
      vscode.commands.executeCommand("tschef.setVariable");
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.refreshPipelines", () =>
      pipeTree.refresh(),
    ),
  );

  // Apply a single operation (with its default args) to the selection — the
  // click action of the Operations sidebar.
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "tschef.applyOperation",
      async (opName: string) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage("ts-chef: No active editor.");
          return;
        }
        const argDefs = argDefsFor(opName);
        if (!argDefs) return;
        try {
          const result = resultToString(
            runOp(
              opName,
              selectionInput(editor),
              argDefs.map(resolveDefaultArg),
            ),
          );
          log(`applyOperation: "${opName}" applied`);
          await presentPipelineResult(
            editor,
            result,
            displayNameFor(opName),
            resultRenderers,
          );
        } catch (e) {
          log(`applyOperation error: ${e}`);
          vscode.window.showErrorMessage(`ts-chef: ${e}`);
        }
      },
    ),
  );

  // Load a saved pipeline into the working recipe and reveal the recipe pane.
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "tschef.loadRecipe",
      async (arg: string | { pipeline?: { name: string } }) => {
        const name =
          typeof arg === "string" ? arg : (arg?.pipeline?.name ?? "");
        const pipeline = name ? pipeStore.findByName(name) : undefined;
        if (!pipeline) return;
        recipeView.loadRecipe(
          pipeline.steps.map((s) => ({ opName: s.opName, args: s.args })),
          pipeline.name,
        );
        await vscode.commands.executeCommand("tschef.recipeView.focus");
      },
    ),
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => {
      if (
        vscode.workspace.getConfiguration("tschef").get("autoScanOnSave", false)
      ) {
        scanState.scan(doc);
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document === doc) decorations.update(editor);
      }
    }),
  );

  /** Open text in a fresh editor beside the current one, in the given language. */
  async function showInNewEditor(
    content: string,
    languageId: string,
  ): Promise<void> {
    const doc = await vscode.workspace.openTextDocument({
      content,
      language: languageId,
    });
    await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
  }

  /** Input text: selection if any, else the whole document. */
  function editorInput(editor: vscode.TextEditor): string {
    return editor.selection.isEmpty
      ? editor.document.getText()
      : editor.document.getText(editor.selection);
  }

  // tschef.toggleEntropyMap — colour lines by Shannon entropy to spot
  // packed/encrypted/encoded blocks at a glance.
  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.toggleEntropyMap", () => {
      const on = entropyMap.toggle();
      log(`Entropy map ${on ? "enabled" : "disabled"}`);
      vscode.window.setStatusBarMessage(
        `ts-chef: Entropy map ${on ? "on" : "off"}`,
        2500,
      );
    }),
  );

  // tschef.yaraScan — run YARA rules against the selection/document.
  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.yaraScan", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("ts-chef: No active editor.");
        return;
      }
      const source = await vscode.window.showQuickPick(
        [
          { label: "$(file) Load rules from a .yar file", kind: "file" as const },
          { label: "$(edit) Type/paste rules", kind: "inline" as const },
        ],
        { placeHolder: "YARA rules source" },
      );
      if (!source) return;

      let rules: string | undefined;
      if (source.kind === "file") {
        const picked = await vscode.window.showOpenDialog({
          canSelectMany: false,
          filters: { "YARA rules": ["yar", "yara", "rules", "txt"] },
          openLabel: "Use these rules",
        });
        if (!picked?.length) return;
        rules = Buffer.from(
          await vscode.workspace.fs.readFile(picked[0]),
        ).toString("utf-8");
      } else {
        rules = await vscode.window.showInputBox({
          prompt: "YARA rule(s)",
          placeHolder: "rule demo { strings: $a = \"foo\" condition: $a }",
        });
      }
      if (!rules) return;

      try {
        // args: rules, showStrings, showLengths, showMeta, showCounts,
        //       showRuleWarnings, showConsole
        const result = (await runOpAsync("YARARules", editorInput(editor), [
          rules,
          true,
          false,
          true,
          true,
          true,
          false,
        ])) as string;
        log(`YARA scan produced ${String(result).length} chars`);
        await showInNewEditor(
          String(result) || "(no matches)",
          "plaintext",
        );
      } catch (e) {
        log(`YARA scan error: ${e}`);
        vscode.window.showErrorMessage(`ts-chef YARA error: ${e}`);
      }
    }),
  );

  // tschef.exportScanResults — write all scan matches to JSON or CSV.
  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.exportScanResults", async () => {
      const entries = scanState.entries();
      if (!entries.length) {
        vscode.window.showInformationMessage(
          "ts-chef: No scan results to export. Scan a document or the workspace first.",
        );
        return;
      }
      const format = await vscode.window.showQuickPick(["JSON", "CSV"], {
        placeHolder: "Export format",
      });
      if (!format) return;

      type Row = {
        file: string;
        line: number;
        column: number;
        value: string;
        label: string;
        confidence: number;
        operation: string;
      };
      const rows: Row[] = [];
      for (const { uri, matches } of entries) {
        for (const m of matches) {
          const top = m.matches[0];
          rows.push({
            file: uri.fsPath,
            line: m.range.start.line + 1,
            column: m.range.start.character + 1,
            value: m.value,
            label: top?.label ?? "",
            confidence: top ? Math.round(top.confidence * 100) / 100 : 0,
            operation: top?.opName ?? "",
          });
        }
      }

      let content: string;
      let ext: string;
      if (format === "CSV") {
        const esc = (v: unknown): string => {
          const s = String(v);
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        };
        const header = "file,line,column,label,confidence,operation,value";
        content = [
          header,
          ...rows.map((r) =>
            [
              r.file,
              r.line,
              r.column,
              r.label,
              r.confidence,
              r.operation,
              r.value,
            ]
              .map(esc)
              .join(","),
          ),
        ].join("\n");
        ext = "csv";
      } else {
        content = JSON.stringify(rows, null, 2);
        ext = "json";
      }

      const target = await vscode.window.showSaveDialog({
        filters: { [format]: [ext] },
        saveLabel: "Export scan results",
      });
      if (!target) return;
      await vscode.workspace.fs.writeFile(target, Buffer.from(content, "utf-8"));
      log(`Exported ${rows.length} scan result(s) as ${format}`);
      vscode.window.showInformationMessage(
        `ts-chef: Exported ${rows.length} result(s) to ${target.fsPath}.`,
      );
    }),
  );

  // tschef.smartFormat — auto-detect a structured format and pretty-print it
  // into a new editor with the matching language mode.
  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.smartFormat", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("ts-chef: No active editor.");
        return;
      }
      const text = editorInput(editor);
      if (!text.trim()) {
        vscode.window.showWarningMessage("ts-chef: Nothing to format.");
        return;
      }
      const choice = detectFormat(text);
      if (!choice || !choice.opName) {
        // No structured format recognised — fall back to readable reflow.
        await vscode.commands.executeCommand("tschef.makeReadable");
        return;
      }
      try {
        const formatted = resultToString(runOp(choice.opName, text, choice.args));
        log(`smartFormat: detected ${choice.label}`);
        await showInNewEditor(formatted, choice.languageId);
        vscode.window.setStatusBarMessage(
          `ts-chef: Formatted as ${choice.label}`,
          2500,
        );
      } catch (e) {
        log(`smartFormat error: ${e}`);
        vscode.window.showErrorMessage(`ts-chef format error: ${e}`);
      }
    }),
  );

  // tschef.makeReadable — reflow extremely long lines/blobs into a readable
  // multi-line form (no data change, whitespace only) in a new editor.
  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.makeReadable", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("ts-chef: No active editor.");
        return;
      }
      const text = editorInput(editor);
      if (!text.trim()) {
        vscode.window.showWarningMessage("ts-chef: Nothing to reflow.");
        return;
      }
      const width = vscode.workspace
        .getConfiguration("tschef")
        .get<number>("readableLineWidth", 100);
      const out = makeReadable(text, width);
      if (out === text) {
        vscode.window.showInformationMessage(
          "ts-chef: Lines are already within a readable width.",
        );
        return;
      }
      log(`makeReadable: reflowed at width ${width}`);
      await showInNewEditor(out, editor.document.languageId);
    }),
  );

  // Apply the entropy map to the editor that is active at startup.
  if (entropyMap.isEnabled() && vscode.window.activeTextEditor) {
    entropyMap.update(vscode.window.activeTextEditor);
  }

  context.subscriptions.push(scanState);
}

/** Called by VS Code when the extension is deactivated; disposables are handled via subscriptions. */
export function deactivate(): void {}
